import os
import json
import time
import random
import sys
from datetime import datetime, timedelta
from typing import List, Optional

import stripe
import resend
from fastapi import FastAPI, Depends, HTTPException, status, Request, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Column, Integer, String, Float, create_engine, func, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel

# ==============================================================================
# 1. CONFIGURATION GLOBALE
# ==============================================================================

# --- Logs de démarrage ---
print("\n" + "#" * 50, flush=True)
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "NouveauChef")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Secret123")
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

print(f"👀 CONFIG : Admin={ADMIN_USERNAME}", flush=True)
print(f"🌍 FRONTEND : {FRONTEND_URL}", flush=True)
print(f"🗄️ DATABASE : {'POSTGRES' if DATABASE_URL else 'SQLITE'}", flush=True)
print("#" * 50 + "\n", flush=True)

# --- Clés API & Sécurité ---
SECRET_KEY = os.getenv("SECRET_KEY", "mon_super_secret_indevinable_12345")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 heures

stripe.api_key = os.getenv("STRIPE_API_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
resend.api_key = RESEND_API_KEY

# --- Outils de hachage & Token ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/token")

# ==============================================================================
# 2. BASE DE DONNÉES
# ==============================================================================

if DATABASE_URL:
    # PROD : On utilise PostgreSQL
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
else:
    # LOCAL : On reste sur SQLite
    print("⚠️  Mode Local : Utilisation de empire.db")
    SQLALCHEMY_DATABASE_URL = "sqlite:///./empire.db"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==============================================================================
# 3. MODÈLES SQL (TABLES)
# ==============================================================================

class AdminUser(Base):
    __tablename__ = "admins"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)


class ProductModel(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Float)
    category = Column(String)
    image_url = Column(String)
    description = Column(String, nullable=True)
    
    # Relation vers les avis
    reviews = relationship(
        "ReviewModel", back_populates="product", cascade="all, delete-orphan"
    )


class ReviewModel(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    author = Column(String)
    rating = Column(Integer)
    comment = Column(String)
    created_at = Column(String, default=lambda: datetime.now().isoformat())

    product = relationship("ProductModel", back_populates="reviews")


class OrderModel(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    stripe_id = Column(String)
    customer_email = Column(String)
    customer_name = Column(String, nullable=True)
    total_amount = Column(Float)
    status = Column(String)
    created_at = Column(String, default=lambda: datetime.now().isoformat())
    items_json = Column(String, default="[]")
    shipping_address_json = Column(String, default="{}")


class EventModel(Base):
    __tablename__ = "analytics_events"
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, index=True)
    user_id = Column(String, index=True)
    page_url = Column(String)
    metadata_json = Column(String)
    created_at = Column(String, default=lambda: datetime.now().isoformat())


# Création des tables au démarrage
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Empire E-commerce API")

# Configuration CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    FRONTEND_URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================================================================
# 4. UTILITAIRES & SÉCURITÉ
# ==============================================================================

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Non autorisé",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(AdminUser).filter(AdminUser.username == username).first()
    if user is None:
        raise credentials_exception
    return user


def create_email_html(customer_name, amount, items_list, address):
    items_html = ""
    for item in items_list:
        items_html += f"<li>{item}</li>"
    
    return f"""
    <h1>Merci {customer_name}!</h1>
    <p>Total: {amount}€</p>
    <ul>{items_html}</ul>
    <p>Livraison à : {address.get('city', 'Non spécifié')}</p>
    """


def send_confirmation_email(to_email, name, amount, items, address):
    if not RESEND_API_KEY:
        return
    try:
        resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": to_email,
            "subject": "Commande Confirmée",
            "html": create_email_html(name, amount, items, address)
        })
    except Exception as e:
        print(f"❌ Erreur email: {e}")


# ==============================================================================
# 5. SCHEMAS PYDANTIC
# ==============================================================================

class Token(BaseModel):
    access_token: str
    token_type: str


class ProductCreateSchema(BaseModel):
    name: str
    price: float
    category: str
    image_url: str
    description: Optional[str] = None


class ProductSchema(ProductCreateSchema):
    id: int

    class Config:
        from_attributes = True


class ReviewCreateSchema(BaseModel):
    author: str
    rating: int
    comment: str


class ReviewSchema(ReviewCreateSchema):
    id: int
    created_at: str

    class Config:
        from_attributes = True


class AnalyticsSchema(BaseModel):
    event_type: str
    user_id: str
    page_url: str
    metadata: dict = {}


class CartItem(BaseModel):
    id: int
    name: str
    price: float
    quantity: int = 1


class CheckoutSchema(BaseModel):
    items: List[CartItem]


# ==============================================================================
# 6. ROUTES API
# ==============================================================================

@app.get("/debug")
def debug_config(db: Session = Depends(get_db)):
    admin_count = db.query(AdminUser).count()
    return {
        "status": "online",
        "db": "POSTGRES" if DATABASE_URL else "SQLITE",
        "admins": admin_count
    }


@app.post("/api/v1/token", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = db.query(AdminUser).filter(AdminUser.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Identifiants incorrects")
    return {
        "access_token": create_access_token(data={"sub": user.username}),
        "token_type": "bearer",
    }


@app.get("/api/v1/admin/me")
async def me(u: AdminUser = Depends(get_current_user)):
    return {"username": u.username}


# --- PRODUITS ---

@app.get("/api/v1/products", response_model=List[ProductSchema])
def get_products(db: Session = Depends(get_db)):
    return db.query(ProductModel).order_by(ProductModel.id.desc()).all()


@app.get("/api/v1/products/{id}", response_model=ProductSchema)
def get_product(id: int, db: Session = Depends(get_db)):
    p = db.query(ProductModel).filter(ProductModel.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    return p


@app.post("/api/v1/products", response_model=ProductSchema)
def create_product(
    p: ProductCreateSchema,
    db: Session = Depends(get_db),
    u: AdminUser = Depends(get_current_user),
):
    new_p = ProductModel(**p.dict())
    db.add(new_p)
    db.commit()
    db.refresh(new_p)
    return new_p


@app.put("/api/v1/products/{id}", response_model=ProductSchema)
def update_product(
    id: int,
    p: ProductCreateSchema,
    db: Session = Depends(get_db),
    u: AdminUser = Depends(get_current_user),
):
    db_p = db.query(ProductModel).filter(ProductModel.id == id).first()
    if not db_p:
        raise HTTPException(status_code=404, detail="Produit non trouvé")

    for k, v in p.dict().items():
        setattr(db_p, k, v)

    db.commit()
    db.refresh(db_p)
    return db_p


@app.delete("/api/v1/products/{id}")
def delete_product(
    id: int, db: Session = Depends(get_db), u: AdminUser = Depends(get_current_user)
):
    p = db.query(ProductModel).filter(ProductModel.id == id).first()
    if p:
        db.delete(p)
        db.commit()
    return {"status": "deleted"}


# --- AVIS ---

@app.get("/api/v1/products/{id}/reviews", response_model=List[ReviewSchema])
def get_reviews(id: int, db: Session = Depends(get_db)):
    return (
        db.query(ReviewModel)
        .filter(ReviewModel.product_id == id)
        .order_by(ReviewModel.created_at.desc())
        .all()
    )


@app.post("/api/v1/products/{id}/reviews", response_model=ReviewSchema)
def create_review(id: int, r: ReviewCreateSchema, db: Session = Depends(get_db)):
    if not db.query(ProductModel).filter(ProductModel.id == id).first():
        raise HTTPException(status_code=404, detail="Produit introuvable")

    nr = ReviewModel(**r.dict(), product_id=id)
    db.add(nr)
    db.commit()
    db.refresh(nr)
    return nr


# --- ANALYTICS (Nom modifié pour éviter AdBlock) ---

@app.post("/api/v1/activity")
def track(e: AnalyticsSchema, db: Session = Depends(get_db)):
    print(f"📥 Tracking reçu: {e.event_type} - {e.page_url}", flush=True)
    db.add(
        EventModel(
            event_type=e.event_type,
            user_id=e.user_id,
            page_url=e.page_url,
            metadata_json=json.dumps(e.metadata),
        )
    )
    db.commit()
    return {"status": "ok"}


@app.get("/api/v1/analytics/stats")
def stats(db: Session = Depends(get_db), u: AdminUser = Depends(get_current_user)):
    total = db.query(EventModel).count()
    sales = db.query(func.sum(OrderModel.total_amount)).scalar() or 0.0
    orders = db.query(OrderModel).count()

    today = datetime.now()
    dates_30 = [(today - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(29, -1, -1)]
    dates_7 = [(today - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(6, -1, -1)]
    chart_30 = {d: 0 for d in dates_30}
    chart_7 = {d: 0 for d in dates_7}

    for o in db.query(OrderModel).all():
        day = o.created_at[:10]
        if day in chart_30:
            chart_30[day] += o.total_amount
        if day in chart_7:
            chart_7[day] += o.total_amount

    stats_query = (
        db.query(EventModel.event_type, func.count(EventModel.event_type))
        .group_by(EventModel.event_type)
        .all()
    )
    stats_by_type = {type_: count for type_, count in stats_query}

    return {
        "summary": {
            "total_sales": sales,
            "total_orders": orders,
            "total_events": total,
            "sales_chart": {
                "30d": [{"date": d, "amount": v} for d, v in chart_30.items()],
                "7d": [{"date": d, "amount": v} for d, v in chart_7.items()],
            },
            "top_products": {},
            "funnel": {
                "1_visitors": stats_by_type.get("page_view", 0),
                "2_interested": stats_by_type.get("view_item", 0),
                "3_converted": stats_by_type.get("add_to_cart", 0),
            },
        },
        "recent_logs": [],
    }


@app.get("/api/v1/orders")
def get_orders(db: Session = Depends(get_db), u: AdminUser = Depends(get_current_user)):
    res = []
    for o in (
        db.query(OrderModel).order_by(OrderModel.created_at.desc()).limit(50).all()
    ):
        res.append(
            {
                "id": o.id,
                "stripe_id": o.stripe_id,
                "customer": o.customer_name,
                "email": o.customer_email,
                "amount": o.total_amount,
                "status": o.status,
                "date": o.created_at,
                "items": json.loads(o.items_json) if o.items_json else [],
                "address": json.loads(o.shipping_address_json)
                if o.shipping_address_json
                else {},
            }
        )
    return res


# --- STRIPE ---

@app.post("/api/v1/create-checkout-session")
def checkout(cart: CheckoutSchema):
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Missing Stripe Key")

    l_items = []
    for i in cart.items:
        l_items.append(
            {
                "price_data": {
                    "currency": "eur",
                    "product_data": {"name": i.name},
                    "unit_amount": int(i.price * 100),
                },
                "quantity": 1,
            }
        )

    s = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=l_items,
        mode="payment",
        success_url=f"{FRONTEND_URL}/success",
        cancel_url=f"{FRONTEND_URL}/cancel",
        shipping_address_collection={"allowed_countries": ["FR"]},
        metadata={"items_summary": json.dumps([f"{i.name}" for i in cart.items])},
    )
    return {"checkout_url": s.url}


@app.post("/api/v1/webhook")
async def webhook(req: Request, bg: BackgroundTasks, db: Session = Depends(get_db)):
    payload = await req.body()
    sig = req.headers.get("stripe-signature")

    try:
        if STRIPE_WEBHOOK_SECRET:
            event = stripe.Webhook.construct_event(
                payload, sig, STRIPE_WEBHOOK_SECRET
            )
        else:
            event = json.loads(payload)
    except Exception:
        raise HTTPException(status_code=400)

    if event["type"] == "checkout.session.completed":
        s = event["data"]["object"]
        d = s.get("customer_details", {}) or {}
        shp = s.get("shipping_details", {}) or {}
        addr = shp.get("address") or d.get("address") or {}
        items_str = s.get("metadata", {}).get("items_summary", "[]")
        items_list = json.loads(items_str)

        db.add(
            OrderModel(
                stripe_id=s.get("id"),
                customer_email=d.get("email"),
                customer_name=d.get("name"),
                total_amount=s.get("amount_total", 0) / 100,
                status="paid",
                items_json=items_str,
                shipping_address_json=json.dumps(addr),
            )
        )

        db.add(
            EventModel(
                event_type="purchase",
                user_id=d.get("email"),
                page_url="/success",
                metadata_json=json.dumps({"amt": s.get("amount_total", 0) / 100}),
            )
        )
        db.commit()

        if d.get("email"):
            bg.add_task(
                send_confirmation_email,
                d.get("email"),
                d.get("name") or "Client",
                s.get("amount_total", 0) / 100,
                items_list,
                addr,
            )

    return {"status": "success"}


# --- SEED & STARTUP ---

def force_reset_admin(db: Session):
    existing = db.query(AdminUser).filter(AdminUser.username == ADMIN_USERNAME).first()
    if existing:
        existing.hashed_password = get_password_hash(ADMIN_PASSWORD)
        print(f"🔄 ADMIN UPDATE: {ADMIN_USERNAME}", flush=True)
    else:
        db.add(
            AdminUser(
                username=ADMIN_USERNAME,
                hashed_password=get_password_hash(ADMIN_PASSWORD),
            )
        )
        print(f"👑 ADMIN CREATE: {ADMIN_USERNAME}", flush=True)
    db.commit()


@app.post("/api/v1/seed")
def seed_database(db: Session = Depends(get_db)):
    # Pas de produits fictifs en production (si DATABASE_URL est présent)
    if not DATABASE_URL and db.query(ProductModel).count() == 0:
        db.add(
            ProductModel(
                name="Empire Gold (Démo Local)",
                price=1299.0,
                category="Luxe",
                image_url="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
            )
        )
        db.commit()

    force_reset_admin(db)
    return {"message": "Checked"}


@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    print("🚀 Démarrage : Création des tables...", flush=True)
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tables créées avec succès.", flush=True)
        seed_database(db)
    except Exception as e:
        print(f"❌ ERREUR CRITIQUE DATABASE : {e}", flush=True)
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)