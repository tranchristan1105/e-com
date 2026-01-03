from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Column, Integer, String, Float, create_engine, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
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

# --- 🚨 CONFIGURATION DEBUG ---
# On affiche clairement ce que Python voit
print("\n" + "="*50)
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "NouveauChef")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Secret123")
print(f"👀 CONFIG CHARGÉE -> User: {ADMIN_USERNAME} / Pass: {ADMIN_PASSWORD}")
print("="*50 + "\n")

# --- CONFIGURATION API ---
SECRET_KEY = os.getenv("SECRET_KEY", "mon_super_secret_indevinable_12345")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 

stripe.api_key = os.getenv("STRIPE_API_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "") 
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/token")

SQLALCHEMY_DATABASE_URL = "sqlite:///./empire.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# --- MODELS ---
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

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Empire E-commerce API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SECURITY UTILS ---
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
        if username is None: raise credentials_exception
    except JWTError: raise credentials_exception
    user = db.query(AdminUser).filter(AdminUser.username == username).first()
    if user is None: raise credentials_exception
    return user

# --- SCHEMAS ---
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
    class Config: from_attributes = True

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

# --- AUTH ROUTE ---
@app.post("/api/v1/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(AdminUser.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants incorrects",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/v1/admin/me")
async def read_users_me(current_user: AdminUser = Depends(get_current_user)):
    return {"username": current_user.username}

# --- PRODUITS ---
@app.get("/api/v1/products", response_model=List[ProductSchema])
def get_products(q: Optional[str] = None, category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ProductModel)
    if q:
        search = f"%{q}%"
        query = query.filter((ProductModel.name.ilike(search)) | (ProductModel.description.ilike(search)))
    if category and category != "Tout":
        query = query.filter(ProductModel.category == category)
    return query.order_by(ProductModel.id.desc()).all()

@app.get("/api/v1/products/{product_id}", response_model=ProductSchema)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not product: raise HTTPException(status_code=404, detail="Produit non trouvé")
    return product

@app.post("/api/v1/products", response_model=ProductSchema)
def create_product(product: ProductCreateSchema, db: Session = Depends(get_db), current_user: AdminUser = Depends(get_current_user)):
    new_product = ProductModel(**product.dict())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@app.put("/api/v1/products/{product_id}", response_model=ProductSchema)
def update_product(product_id: int, product: ProductCreateSchema, db: Session = Depends(get_db), current_user: AdminUser = Depends(get_current_user)):
    db_product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not db_product: raise HTTPException(status_code=404, detail="Produit introuvable")
    
    db_product.name = product.name
    db_product.price = product.price
    db_product.category = product.category
    db_product.image_url = product.image_url
    db_product.description = product.description
    
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/api/v1/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), current_user: AdminUser = Depends(get_current_user)):
    product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not product: raise HTTPException(status_code=404, detail="Produit introuvable")
    db.delete(product)
    db.commit()
    return {"status": "deleted"}

# --- ANALYTICS ---
@app.post("/api/v1/analytics")
def track_event(event: AnalyticsSchema, db: Session = Depends(get_db)):
    try:
        db.add(EventModel(
            event_type=event.event_type,
            user_id=event.user_id,
            page_url=event.page_url,
            metadata_json=json.dumps(event.metadata)
        ))
        db.commit()
        return {"status": "recorded"}
    except Exception as e: return {"status": "error", "detail": str(e)}

@app.get("/api/v1/analytics/stats")
def get_analytics_stats(db: Session = Depends(get_db), current_user: AdminUser = Depends(get_current_user)):
    total = db.query(EventModel).count()
    stats_query = db.query(EventModel.event_type, func.count(EventModel.event_type)).group_by(EventModel.event_type).all()
    stats_by_type = {type_: count for type_, count in stats_query}

    product_events = db.query(EventModel).filter(EventModel.event_type.in_(['view_item', 'add_to_cart'])).all()
    product_counts = {}
    for event in product_events:
        try:
            data = json.loads(event.metadata_json)
            name = data.get('name', 'Inconnu')
            if name and name != 'Inconnu': product_counts[name] = product_counts.get(name, 0) + 1
        except: continue
    sorted_products = dict(sorted(product_counts.items(), key=lambda item: item[1], reverse=True)[:10])

    funnel_data = {
        "1_visitors": stats_by_type.get('page_view', 0),
        "2_interested": stats_by_type.get('view_item', 0),
        "3_converted": stats_by_type.get('add_to_cart', 0)
    }
    
    total_sales = db.query(func.sum(OrderModel.total_amount)).scalar() or 0.0
    orders_count = db.query(OrderModel).count()
    recent_logs = db.query(EventModel).order_by(EventModel.created_at.desc()).limit(20).all()
    
    return {
        "summary": {
            "total_events": total,
            "total_sales": total_sales,
            "total_orders": orders_count,
            "breakdown": stats_by_type,
            "top_products": sorted_products,
            "funnel": funnel_data
        },
        "recent_logs": recent_logs
    }

@app.get("/api/v1/orders")
def get_orders(db: Session = Depends(get_db), current_user: AdminUser = Depends(get_current_user)):
    orders = db.query(OrderModel).order_by(OrderModel.created_at.desc()).limit(50).all()
    result = []
    for o in orders:
        try:
            items = json.loads(o.items_json)
            address = json.loads(o.shipping_address_json) if o.shipping_address_json else {}
        except:
            items = []
            address = {}
        result.append({
            "id": o.id,
            "stripe_id": o.stripe_id,
            "customer": o.customer_name,
            "email": o.customer_email,
            "amount": o.total_amount,
            "status": o.status,
            "date": o.created_at,
            "items": items,
            "address": address
        })
    return result

# --- PAIEMENT ---
@app.post("/api/v1/create-checkout-session")
def create_checkout_session(cart: CheckoutSchema):
    try:
        if not stripe.api_key: raise Exception("Clé Stripe manquante")
        c_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        if c_url.endswith('/'): c_url = c_url[:-1]
        line_items = []
        summary_items = [] 
        for item in cart.items:
            line_items.append({
                'price_data': {
                    'currency': 'eur',
                    'product_data': {'name': item.name},
                    'unit_amount': int(item.price * 100),
                },
                'quantity': 1,
            })
            summary_items.append(f"{item.name} ({item.price}€)")
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url=f'{c_url}/success?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=f'{c_url}/cancel',
            shipping_address_collection={"allowed_countries": ["FR", "BE", "CH", "CA"]},
            metadata={"items_summary": json.dumps(summary_items)}
        )
        return {"checkout_url": checkout_session.url}
    except Exception as e:
        print(f"Stripe Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    try:
        if STRIPE_WEBHOOK_SECRET:
            event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
        else:
            event = json.loads(payload)
    except ValueError: raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError: raise HTTPException(status_code=400, detail="Invalid signature")

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        stripe_id = session.get('id')
        amount = session.get('amount_total', 0) / 100
        customer_details = session.get('customer_details', {}) or {}
        shipping = session.get('shipping_details', {}) or {}
        address_data = shipping.get('address')
        if not address_data and customer_details.get('address'): address_data = customer_details.get('address')
        if not address_data: address_data = {}
        items_json = session.get('metadata', {}).get('items_summary', '[]')
        new_order = OrderModel(
            stripe_id=stripe_id,
            customer_email=customer_details.get('email'),
            customer_name=customer_details.get('name'),
            total_amount=amount,
            status="paid",
            items_json=items_json,
            shipping_address_json=json.dumps(address_data)
        )
        db.add(new_order)
        
        # Analytics Purchase
        purchase_event = EventModel(
            event_type="purchase",
            user_id=customer_details.get('email') or "anonyme",
            page_url="/checkout/success",
            metadata_json=json.dumps({"amount": amount})
        )
        db.add(purchase_event)
        
        db.commit()
    return {"status": "success"}

# --- NETTOYAGE & SEED FORCÉ ---
def force_reset_admin(db: Session):
    # 🧹 On supprime tous les anciens admins pour être sûr
    deleted = db.query(AdminUser).delete()
    if deleted > 0:
        print(f"🧹 Nettoyage : {deleted} ancien(s) admin(s) supprimé(s).")
    
    # 🆕 On crée le nouveau
    admin = AdminUser(username=ADMIN_USERNAME, hashed_password=get_password_hash(ADMIN_PASSWORD))
    db.add(admin)
    db.commit()
    print(f"👑 ADMIN RECRÉÉ -> Login: {ADMIN_USERNAME} / Pass: {ADMIN_PASSWORD}")

@app.post("/api/v1/seed")
def seed_database(db: Session = Depends(get_db)):
    if db.query(ProductModel).count() == 0:
        products = [
            ProductModel(name="iPhone 15 Pro", price=1299.0, category="Smartphone", image_url="https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800", description="Titane pur."),
            ProductModel(name="MacBook Air M2", price=1499.0, category="Ordinateur", image_url="https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=800", description="Puce M2."),
        ]
        db.add_all(products)
    
    # Fake Analytics
    if db.query(EventModel).count() == 0:
        events = []
        for _ in range(50): events.append(EventModel(event_type="page_view", user_id="visitor", page_url="/"))
        for _ in range(20): events.append(EventModel(event_type="view_item", user_id="visitor", page_url="/product", metadata_json="{}"))
        for _ in range(5): events.append(EventModel(event_type="add_to_cart", user_id="visitor", page_url="/cart", metadata_json="{}"))
        db.add_all(events)

    db.commit()
    
    # On force la réinitialisation de l'admin même dans le seed manuel
    force_reset_admin(db)
    return {"message": "DB seeded & Admin Reset"}

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    # 1. On lance le seed normal (produits, stats)
    seed_database(db)
    # 2. On lance la méthode nucléaire pour l'admin
    force_reset_admin(db)
    db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)