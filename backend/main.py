from fastapi import FastAPI, Depends, HTTPException, status, Request, BackgroundTasks
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
import sys
import resend 

# ==============================================================================
# 1. CONFIGURATION GLOBALE
# ==============================================================================

# --- Identifiants Admin (Configurable via Cloud Run) ---
print("\n" + "#"*50, flush=True)
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "NouveauChef")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Secret123")
RESEND_API_KEY = os.getenv("RESEND_API_KEY") 
print(f"👀 CONFIG : Admin={ADMIN_USERNAME}, Resend={'OK' if RESEND_API_KEY else 'MANQUANT'}", flush=True)
print("#"*50 + "\n", flush=True)

# --- Clés API & Sécurité ---
SECRET_KEY = os.getenv("SECRET_KEY", "mon_super_secret_indevinable_12345")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 heures

stripe.api_key = os.getenv("STRIPE_API_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "") 
resend.api_key = RESEND_API_KEY
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

# --- Outils de hachage & Token ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/token")

# ==============================================================================
# 2. BASE DE DONNÉES
# ==============================================================================
SQLALCHEMY_DATABASE_URL = "sqlite:///./empire.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# --- Modèles SQL (Tables) ---
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

# Création des tables au démarrage
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
# 3. UTILITAIRES & FONCTIONS
# ==============================================================================

# --- Emails (Resend) - DESIGN PREMIUM ---
def create_email_html(customer_name, amount, items_list, address):
    # Création d'une liste propre avec des bordures légères
    items_html = "".join([
        f"""
        <li style='padding: 12px 0; border-bottom: 1px solid #f1f5f9; list-style: none; display: flex; justify-content: space-between; color: #475569;'>
            <span style='font-weight: 500;'>{item}</span>
            <span style='color: #2563eb;'>✔</span>
        </li>
        """ for item in items_list
    ])
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
        </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    
                    <!-- Carte Principale -->
                    <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05); border: 1px solid #f1f5f9;">
                        
                        <!-- Header / Bannière -->
                        <tr>
                            <td style="padding: 40px 40px 30px 40px; background: linear-gradient(135deg, #111827 0%, #1f2937 100%); text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; letter-spacing: -0.5px; font-weight: 800;">EMPIRE.</h1>
                                <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Confirmation de commande</p>
                            </td>
                        </tr>

                        <!-- Contenu -->
                        <tr>
                            <td style="padding: 40px;">
                                <h2 style="margin: 0 0 15px 0; color: #1e293b; font-size: 24px; font-weight: 700; text-align: center;">Merci {customer_name} ! 🚀</h2>
                                <p style="margin: 0 0 30px 0; color: #64748b; font-size: 16px; line-height: 1.6; text-align: center;">
                                    Votre commande a bien été reçue. Nous préparons votre colis avec le plus grand soin.
                                </p>

                                <!-- Bloc Récapitulatif -->
                                <div style="background-color: #f8fafc; border-radius: 16px; padding: 30px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
                                    <h3 style="margin: 0 0 15px 0; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Votre Sélection</h3>
                                    <ul style="padding: 0; margin: 0;">
                                        {items_html}
                                    </ul>
                                    <div style="margin-top: 20px; padding-top: 20px; border-top: 2px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: center;">
                                        <span style="color: #64748b; font-weight: 600;">Total payé</span>
                                        <span style="color: #0f172a; font-size: 28px; font-weight: 800;">{amount} €</span>
                                    </div>
                                </div>

                                <!-- Bloc Livraison -->
                                <div style="background-color: #eff6ff; border-radius: 16px; padding: 25px; border: 1px solid #bfdbfe; display: flex; align-items: start;">
                                    <div style="font-size: 24px; margin-right: 15px;">📦</div>
                                    <div>
                                        <h3 style="margin: 0 0 5px 0; color: #1e40af; font-size: 15px; font-weight: 700;">Adresse de livraison</h3>
                                        <p style="margin: 0; color: #1e3a8a; font-size: 15px; line-height: 1.5;">
                                            {address.get('line1', '')}<br>
                                            {address.get('postal_code', '')} {address.get('city', '')}<br>
                                            <span style="font-weight: 600; text-transform: uppercase;">{address.get('country', '')}</span>
                                        </p>
                                    </div>
                                </div>

                                <!-- Bouton Action -->
                                <div style="text-align: center; margin-top: 40px;">
                                    <a href="{frontend_url}" style="background-color: #000000; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-weight: 600; font-size: 16px; display: inline-block; transition: transform 0.2s;">
                                        Retourner à la boutique
                                    </a>
                                </div>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="padding: 30px; background-color: #f8fafc; text-align: center; border-top: 1px solid #f1f5f9;">
                                <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.5;">
                                    Une question ? Répondez simplement à cet email.<br>
                                    © 2024 Empire Store. Tous droits réservés.
                                </p>
                            </td>
                        </tr>
                    </table>
                    
                    <div style="margin-top: 20px; color: #cbd5e1; font-size: 12px; text-align: center;">
                        Envoyé avec ❤️ par votre API Empire
                    </div>

                </td>
            </tr>
        </table>
    </body>
    </html>
    """

def send_confirmation_email(to_email: str, name: str, amount: float, items: list, address: dict):
    if not RESEND_API_KEY:
        print("⚠️ Pas de clé Resend, email ignoré.")
        return
    try:
        html_content = create_email_html(name, amount, items, address)
        r = resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": to_email, 
            "subject": f"Confirmation de commande Empire (#{int(time.time())})",
            "html": html_content
        })
        print(f"📧 Email envoyé à {to_email} ! ID: {r.get('id')}")
    except Exception as e:
        print(f"❌ Erreur envoi email: {e}")

# --- Sécurité (Password & Token) ---
def verify_password(plain_password, hashed_password): return pwd_context.verify(plain_password, hashed_password)
def get_password_hash(password): return pwd_context.hash(password)
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Non autorisé", headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None: raise credentials_exception
    except JWTError: raise credentials_exception
    user = db.query(AdminUser).filter(AdminUser.username == username).first()
    if user is None: raise credentials_exception
    return user

# ==============================================================================
# 4. SCHEMAS PYDANTIC (Validation)
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
@app.get("/debug")
def debug_config(db: Session = Depends(get_db)):
    current_admin = db.query(AdminUser).first()
    return {"status": "online", "configured_user": ADMIN_USERNAME, "db_current_admin": current_admin.username if current_admin else "None"}

@app.post("/api/v1/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(AdminUser.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Identifiants incorrects", headers={"WWW-Authenticate": "Bearer"})
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/v1/admin/me")
async def read_users_me(current_user: AdminUser = Depends(get_current_user)): return {"username": current_user.username}

# --- Produits (CRUD) ---
@app.get("/api/v1/products", response_model=List[ProductSchema])
def get_products(q: Optional[str] = None, category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ProductModel)
    if q: search = f"%{q}%"; query = query.filter((ProductModel.name.ilike(search)) | (ProductModel.description.ilike(search)))
    if category and category != "Tout": query = query.filter(ProductModel.category == category)
    return query.order_by(ProductModel.id.desc()).all()

@app.get("/api/v1/products/{product_id}", response_model=ProductSchema)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not product: raise HTTPException(status_code=404, detail="Produit non trouvé")
    return product

@app.post("/api/v1/products", response_model=ProductSchema)
def create_product(product: ProductCreateSchema, db: Session = Depends(get_db), current_user: AdminUser = Depends(get_current_user)):
    new_product = ProductModel(**product.dict())
    db.add(new_product); db.commit(); db.refresh(new_product); return new_product

@app.put("/api/v1/products/{product_id}", response_model=ProductSchema)
def update_product(product_id: int, product: ProductCreateSchema, db: Session = Depends(get_db), current_user: AdminUser = Depends(get_current_user)):
    db_product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not db_product: raise HTTPException(status_code=404, detail="Produit introuvable")
    for key, value in product.dict().items(): setattr(db_product, key, value)
    db.commit(); db.refresh(db_product); return db_product

@app.delete("/api/v1/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), current_user: AdminUser = Depends(get_current_user)):
    product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not product: raise HTTPException(status_code=404, detail="Produit introuvable")
    db.delete(product); db.commit(); return {"status": "deleted"}

# --- Analytics & Dashboard ---
@app.post("/api/v1/analytics")
def track_event(event: AnalyticsSchema, db: Session = Depends(get_db)):
    try:
        db.add(EventModel(event_type=event.event_type, user_id=event.user_id, page_url=event.page_url, metadata_json=json.dumps(event.metadata)))
        db.commit(); return {"status": "recorded"}
    except Exception as e: return {"status": "error", "detail": str(e)}

@app.get("/api/v1/analytics/stats")
def get_analytics_stats(db: Session = Depends(get_db), current_user: AdminUser = Depends(get_current_user)):
    total = db.query(EventModel).count()
    stats_query = db.query(EventModel.event_type, func.count(EventModel.event_type)).group_by(EventModel.event_type).all()
    stats_by_type = {type_: count for type_, count in stats_query}
    
    # Top Produits
    product_events = db.query(EventModel).filter(EventModel.event_type.in_(['view_item', 'add_to_cart'])).all()
    product_counts = {}
    for event in product_events:
        try:
            data = json.loads(event.metadata_json)
            name = data.get('name', 'Inconnu')
            if name and name != 'Inconnu': product_counts[name] = product_counts.get(name, 0) + 1
        except: continue
    sorted_products = dict(sorted(product_counts.items(), key=lambda item: item[1], reverse=True)[:10])

    funnel_data = { "1_visitors": stats_by_type.get('page_view', 0), "2_interested": stats_by_type.get('view_item', 0), "3_converted": stats_by_type.get('add_to_cart', 0) }
    total_sales = db.query(func.sum(OrderModel.total_amount)).scalar() or 0.0
    orders_count = db.query(OrderModel).count()
    
    # Chart 7d / 30d
    today = datetime.now()
    dates_7 = [(today - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(6, -1, -1)]
    dates_30 = [(today - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(29, -1, -1)]
    chart_7 = {d: 0 for d in dates_7}; chart_30 = {d: 0 for d in dates_30}
    
    all_orders = db.query(OrderModel).all()
    for order in all_orders:
        order_day = order.created_at[:10]
        if order_day in chart_7: chart_7[order_day] += order.total_amount
        if order_day in chart_30: chart_30[order_day] += order.total_amount
            
    sales_chart = { "7d": [{"date": d, "amount": chart_7[d]} for d in dates_7], "30d": [{"date": d, "amount": chart_30[d]} for d in dates_30] }
    recent_logs = db.query(EventModel).order_by(EventModel.created_at.desc()).limit(20).all()
    
    return { "summary": { "total_events": total, "total_sales": total_sales, "total_orders": orders_count, "breakdown": stats_by_type, "top_products": sorted_products, "funnel": funnel_data, "sales_chart": sales_chart }, "recent_logs": recent_logs }

@app.get("/api/v1/orders")
def get_orders(db: Session = Depends(get_db), current_user: AdminUser = Depends(get_current_user)):
    orders = db.query(OrderModel).order_by(OrderModel.created_at.desc()).limit(50).all()
    result = []
    for o in orders:
        try: items = json.loads(o.items_json); address = json.loads(o.shipping_address_json) if o.shipping_address_json else {}
        except: items = []; address = {}
        result.append({ "id": o.id, "stripe_id": o.stripe_id, "customer": o.customer_name, "email": o.customer_email, "amount": o.total_amount, "status": o.status, "date": o.created_at, "items": items, "address": address })
    return result

# --- PAIEMENT & WEBHOOK ---
@app.post("/api/v1/create-checkout-session")
def create_checkout_session(cart: CheckoutSchema):
    try:
        if not stripe.api_key: raise Exception("Clé Stripe manquante")
        c_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        if c_url.endswith('/'): c_url = c_url[:-1]
        line_items = []; summary_items = [] 
        for item in cart.items:
            line_items.append({ 'price_data': { 'currency': 'eur', 'product_data': {'name': item.name}, 'unit_amount': int(item.price * 100) }, 'quantity': 1 })
            summary_items.append(f"{item.name} ({item.price}€)")
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'], line_items=line_items, mode='payment', success_url=f'{c_url}/success?session_id={{CHECKOUT_SESSION_ID}}', cancel_url=f'{c_url}/cancel',
            shipping_address_collection={"allowed_countries": ["FR", "BE", "CH", "CA"]}, metadata={"items_summary": json.dumps(summary_items)}
        )
        return {"checkout_url": checkout_session.url}
    except Exception as e: print(f"Stripe Error: {e}", flush=True); raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/webhook")
async def stripe_webhook(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    try:
        if STRIPE_WEBHOOK_SECRET: event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
        else: event = json.loads(payload)
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
        items_json_str = session.get('metadata', {}).get('items_summary', '[]')
        items_list = json.loads(items_json_str)

        new_order = OrderModel(
            stripe_id=stripe_id, customer_email=customer_details.get('email'), customer_name=customer_details.get('name'), total_amount=amount, status="paid",
            items_json=items_json_str, shipping_address_json=json.dumps(address_data)
        )
        db.add(new_order)
        
        purchase_event = EventModel(event_type="purchase", user_id=customer_details.get('email') or "anonyme", page_url="/checkout/success", metadata_json=json.dumps({"amount": amount}))
        db.add(purchase_event)
        db.commit()

        # Envoi email en tâche de fond (Background)
        if customer_details.get('email'):
            background_tasks.add_task(
                send_confirmation_email,
                to_email=customer_details.get('email'),
                name=customer_details.get('name') or "Client",
                amount=amount,
                items=items_list,
                address=address_data
            )

    return {"status": "success"}

# --- INIT & SEED ---
def force_reset_admin(db: Session):
    deleted = db.query(AdminUser).delete(); print(f"🧹 ADMIN CLEANUP: {deleted} comptes.", flush=True)
    admin = AdminUser(username=ADMIN_USERNAME, hashed_password=get_password_hash(ADMIN_PASSWORD))
    db.add(admin); db.commit(); print(f"👑 ADMIN RESET: {ADMIN_USERNAME}", flush=True)

@app.post("/api/v1/seed")
def seed_database(db: Session = Depends(get_db)):
    if db.query(ProductModel).count() == 0:
        products = [ ProductModel(name="iPhone 15 Pro", price=1299.0, category="Smartphone", image_url="https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800", description="Titane pur."), ProductModel(name="MacBook Air M2", price=1499.0, category="Ordinateur", image_url="https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=800", description="Puce M2.") ]
        db.add_all(products)
    if db.query(EventModel).count() == 0:
        events = []
        for _ in range(50): events.append(EventModel(event_type="page_view", user_id="visitor", page_url="/"))
        db.add_all(events)
    db.commit(); force_reset_admin(db); return {"message": "DB seeded"}

@app.on_event("startup")
def startup_event():
    db = SessionLocal(); seed_database(db); force_reset_admin(db); db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)