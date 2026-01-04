from fastapi import FastAPI, Depends, HTTPException, status, Request, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Column, Integer, String, Float, create_engine, func, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from passlib.context import CryptContext
from jose import JWTError, jwt
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
import json
import time
import stripe
import os
import random
import sys
import resend 

# ==============================================================================
# 1. CONFIGURATION
# ==============================================================================
# Logs de démarrage pour vérifier les variables
print("\n" + "#"*50, flush=True)
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "NouveauChef")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Secret123")
RESEND_API_KEY = os.getenv("RESEND_API_KEY") 
print(f"👀 CONFIG : Admin={ADMIN_USERNAME}, Resend={'OK' if RESEND_API_KEY else 'MANQUANT'}", flush=True)
print("#"*50 + "\n", flush=True)

SECRET_KEY = os.getenv("SECRET_KEY", "mon_super_secret_indevinable_12345")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 

stripe.api_key = os.getenv("STRIPE_API_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "") 
resend.api_key = RESEND_API_KEY
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/token")

SQLALCHEMY_DATABASE_URL = "sqlite:///./empire.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==============================================================================
# 2. MODÈLES SQL (TABLES)
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
    reviews = relationship("ReviewModel", back_populates="product", cascade="all, delete-orphan")

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

# Création des tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Empire E-commerce API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# 3. UTILITAIRES & SÉCURITÉ
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

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
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

# --- Emails HTML (Design Premium) ---
def create_email_html(customer_name, amount, items_list, address):
    items_html = ""
    for item in items_list:
        items_html += f"""
        <li style='padding: 12px 0; border-bottom: 1px solid #f1f5f9; list-style: none; display: flex; justify-content: space-between; color: #475569;'>
            <span style='font-weight: 500;'>{item}</span>
            <span style='color: #2563eb;'>✔</span>
        </li>
        """
    
    return f"""
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Helvetica',sans-serif;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
            <tr>
                <td align="center" style="padding:40px 0;">
                    <table role="presentation" style="width:100%;max-width:600px;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.05);border:1px solid #f1f5f9;">
                        <tr>
                            <td style="padding:40px;background:#111827;text-align:center;">
                                <h1 style="color:#fff;margin:0;">EMPIRE.</h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:40px;">
                                <h2 style="color:#1e293b;text-align:center;">Merci {customer_name} ! 🚀</h2>
                                <p style="text-align:center;color:#64748b;">Votre commande est confirmée.</p>
                                <div style="background:#f8fafc;border-radius:16px;padding:30px;margin:30px 0;">
                                    <h3 style="margin-top:0;">Votre Commande</h3>
                                    <ul style="padding:0;margin:0;">{items_html}</ul>
                                    <p style="text-align:right;font-weight:bold;font-size:24px;margin-top:20px;">{amount} €</p>
                                </div>
                                <div style="background:#eff6ff;padding:20px;border-radius:12px;color:#1e40af;">
                                    <strong>Expédié à :</strong><br>
                                    {address.get('line1', '')}<br>
                                    {address.get('postal_code', '')} {address.get('city', '')}
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

def send_confirmation_email(to_email: str, name: str, amount: float, items: list, address: dict):
    if not RESEND_API_KEY:
        return
    try:
        html_content = create_email_html(name, amount, items, address)
        resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": to_email,
            "subject": "Commande Empire Confirmée",
            "html": html_content
        })
        print(f"📧 Email envoyé à {to_email}")
    except Exception as e:
        print(f"❌ Erreur email: {e}")

# ==============================================================================
# 4. SCHEMAS PYDANTIC (CORRIGÉS ET INDENTÉS)
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
# 5. ROUTES API
# ==============================================================================

# --- Debug & Auth ---
@app.post("/api/v1/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(AdminUser.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Identifiants incorrects")
    return {"access_token": create_access_token(data={"sub": user.username}), "token_type": "bearer"}

@app.get("/api/v1/admin/me")
async def read_users_me(current_user: AdminUser = Depends(get_current_user)):
    return {"username": current_user.username}

# --- Produits (CRUD) ---
@app.get("/api/v1/products", response_model=List[ProductSchema])
def get_products(db: Session = Depends(get_db)):
    return db.query(ProductModel).order_by(ProductModel.id.desc()).all()

@app.get("/api/v1/products/{product_id}", response_model=ProductSchema)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    return product

@app.post("/api/v1/products", response_model=ProductSchema)
def create_product(p: ProductCreateSchema, db: Session = Depends(get_db), u: AdminUser = Depends(get_current_user)):
    new_p = ProductModel(**p.dict())
    db.add(new_p)
    db.commit()
    db.refresh(new_p)
    return new_p

@app.put("/api/v1/products/{product_id}", response_model=ProductSchema)
def update_product(product_id: int, p: ProductCreateSchema, db: Session = Depends(get_db), u: AdminUser = Depends(get_current_user)):
    db_p = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not db_p:
        raise HTTPException(status_code=404, detail="Produit introuvable")
    
    for k, v in p.dict().items():
        setattr(db_p, k, v)
    
    db.commit()
    db.refresh(db_p)
    return db_p

@app.delete("/api/v1/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), u: AdminUser = Depends(get_current_user)):
    p = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if p:
        db.delete(p)
        db.commit()
    return {"status": "deleted"}

# --- Avis Clients (Reviews) ---
@app.get("/api/v1/products/{product_id}/reviews", response_model=List[ReviewSchema])
def get_reviews(product_id: int, db: Session = Depends(get_db)):
    return db.query(ReviewModel).filter(ReviewModel.product_id == product_id).order_by(ReviewModel.created_at.desc()).all()

@app.post("/api/v1/products/{product_id}/reviews", response_model=ReviewSchema)
def create_review(product_id: int, review: ReviewCreateSchema, db: Session = Depends(get_db)):
    if not db.query(ProductModel).filter(ProductModel.id == product_id).first():
        raise HTTPException(status_code=404, detail="Produit introuvable")
    
    new_review = ReviewModel(**review.dict(), product_id=product_id)
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return new_review

# --- Analytics & Dashboard ---
@app.post("/api/v1/analytics")
def track_event(e: AnalyticsSchema, db: Session = Depends(get_db)):
    db.add(EventModel(
        event_type=e.event_type,
        user_id=e.user_id,
        page_url=e.page_url,
        metadata_json=json.dumps(e.metadata)
    ))
    db.commit()
    return {"status": "ok"}

@app.get("/api/v1/analytics/stats")
def get_stats(db: Session = Depends(get_db), u: AdminUser = Depends(get_current_user)):
    total = db.query(EventModel).count()
    sales = db.query(func.sum(OrderModel.total_amount)).scalar() or 0.0
    orders = db.query(OrderModel).count()
    
    # Graphique 30 jours
    today = datetime.now()
    dates_30 = [(today - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(29, -1, -1)]
    chart_30 = {d: 0 for d in dates_30}
    
    for o in db.query(OrderModel).all():
        day = o.created_at[:10]
        if day in chart_30:
            chart_30[day] += o.total_amount
            
    return {
        "summary": {
            "total_sales": sales,
            "total_orders": orders,
            "total_events": total,
            "sales_chart": {"30d": [{"date": d, "amount": v} for d, v in chart_30.items()]},
            "top_products": {},
            "funnel": {"1_visitors": 0, "2_interested": 0, "3_converted": 0}
        },
        "recent_logs": []
    }

@app.get("/api/v1/orders")
def get_orders(db: Session = Depends(get_db), u: AdminUser = Depends(get_current_user)):
    res = []
    for o in db.query(OrderModel).order_by(OrderModel.created_at.desc()).limit(50).all():
        res.append({
            "id": o.id,
            "stripe_id": o.stripe_id,
            "customer": o.customer_name,
            "email": o.customer_email,
            "amount": o.total_amount,
            "status": o.status,
            "date": o.created_at,
            "items": json.loads(o.items_json) if o.items_json else [],
            "address": json.loads(o.shipping_address_json) if o.shipping_address_json else {}
        })
    return res

# --- Stripe ---
@app.post("/api/v1/create-checkout-session")
def create_session(cart: CheckoutSchema):
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe Key missing")
    
    l_items = []
    for i in cart.items:
        l_items.append({
            'price_data': {
                'currency': 'eur',
                'product_data': {'name': i.name},
                'unit_amount': int(i.price * 100)
            },
            'quantity': 1
        })
        
    s = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=l_items,
        mode='payment',
        success_url=f'{frontend_url}/success',
        cancel_url=f'{frontend_url}/cancel',
        shipping_address_collection={"allowed_countries": ["FR"]},
        metadata={"items_summary": json.dumps([f"{i.name} ({i.price}€)" for i in cart.items])}
    )
    return {"checkout_url": s.url}

@app.post("/api/v1/webhook")
async def webhook(req: Request, bg: BackgroundTasks, db: Session = Depends(get_db)):
    payload = await req.body()
    sig = req.headers.get('stripe-signature')
    
    try:
        if STRIPE_WEBHOOK_SECRET:
            event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
        else:
            event = json.loads(payload)
    except:
        raise HTTPException(status_code=400)
    
    if event['type'] == 'checkout.session.completed':
        s = event['data']['object']
        details = s.get('customer_details', {}) or {}
        shipping = s.get('shipping_details', {}) or {}
        addr = shipping.get('address') or details.get('address') or {}
        items_str = s.get('metadata', {}).get('items_summary', '[]')
        
        db.add(OrderModel(
            stripe_id=s.get('id'),
            customer_email=details.get('email'),
            customer_name=details.get('name'),
            total_amount=s.get('amount_total', 0) / 100,
            status="paid",
            items_json=items_str,
            shipping_address_json=json.dumps(addr)
        ))
        
        db.add(EventModel(
            event_type="purchase",
            user_id=details.get('email'),
            page_url="/success",
            metadata_json=json.dumps({"amt": s.get('amount_total', 0) / 100})
        ))
        db.commit()
        
        if details.get('email'):
            bg.add_task(
                send_confirmation_email,
                details.get('email'),
                details.get('name') or "Client",
                s.get('amount_total', 0) / 100,
                json.loads(items_str),
                addr
            )
            
    return {"status": "success"}

# --- Seed & Startup ---
def force_reset_admin(db: Session):
    db.query(AdminUser).delete()
    print("🧹 ADMIN CLEANUP: OK.", flush=True)
    admin = AdminUser(username=ADMIN_USERNAME, hashed_password=get_password_hash(ADMIN_PASSWORD))
    db.add(admin)
    db.commit()
    print(f"👑 ADMIN RESET: {ADMIN_USERNAME}", flush=True)

@app.post("/api/v1/seed")
def seed(db: Session = Depends(get_db)):
    if db.query(ProductModel).count() == 0:
        p1 = ProductModel(name="Empire Edition Gold", price=1299.0, category="Horlogerie", image_url="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800", description="L'excellence.")
        p2 = ProductModel(name="MacBook Air M2", price=1499.0, category="Tech", image_url="https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=800", description="Puce M2.")
        db.add_all([p1, p2])
        db.commit()
        
        # Ajout de faux avis pour la démo
        reviews = [
            ReviewModel(product_id=p1.id, author="Jean D.", rating=5, comment="Incroyable qualité."),
            ReviewModel(product_id=p1.id, author="Sophie M.", rating=4, comment="Très beau produit."),
            ReviewModel(product_id=p2.id, author="Lucas V.", rating=5, comment="Machine de guerre.")
        ]
        db.add_all(reviews)
        db.commit()
        
    force_reset_admin(db)
    return {"message": "Seeded"}

@app.on_event("startup")
def startup():
    db = SessionLocal()
    seed(db)
    force_reset_admin(db)
    db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)