from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
import json
import time
import stripe
import os

# --- CONFIGURATION ---
stripe.api_key = os.getenv("STRIPE_API_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "") 
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

if not stripe.api_key:
    print("❌ ERREUR : Clé Stripe manquante !")

from app.core.database import engine, Base, get_db
from app.models.product import Product as ProductModel, AnalyticsEvent as EventModel, Order as OrderModel

# Init DB
while True:
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Base de données connectée !")
        break
    except Exception as e:
        print("⏳ Attente de la DB...")
        time.sleep(3)

app = FastAPI(title="Empire E-commerce API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SCHEMAS ---
class ProductSchema(BaseModel):
    id: int
    name: str
    price: float
    category: str
    image_url: str
    description: Optional[str] = None
    class Config:
        from_attributes = True

class OrderSchema(BaseModel):
    id: int
    stripe_id: str
    customer_email: str
    total_amount: float
    status: str
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

# --- ROUTES PUBLIQUES ---

@app.get("/api/v1/products", response_model=List[ProductSchema])
def get_products(q: Optional[str] = None, category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ProductModel)
    if q:
        search = f"%{q}%"
        query = query.filter((ProductModel.name.ilike(search)) | (ProductModel.description.ilike(search)))
    if category and category != "Tout":
        query = query.filter(ProductModel.category == category)
    return query.all()

@app.get("/api/v1/products/{product_id}", response_model=ProductSchema)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not product: raise HTTPException(status_code=404, detail="Produit non trouvé")
    return product

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

# --- ROUTES ADMIN / DASHBOARD ---

@app.get("/api/v1/analytics/stats")
def get_analytics_stats(db: Session = Depends(get_db)):
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
def get_orders(db: Session = Depends(get_db)):
    orders = db.query(OrderModel).order_by(OrderModel.created_at.desc()).limit(50).all()
    
    result = []
    for o in orders:
        try:
            items = json.loads(o.items_json)
            if o.shipping_address_json:
                address = json.loads(o.shipping_address_json)
            else:
                address = {}
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
            metadata={
                "items_summary": json.dumps(summary_items)
            }
        )
        return {"checkout_url": checkout_session.url}
    except Exception as e:
        print(f"Stripe Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# --- WEBHOOK AMÉLIORÉ ---
@app.post("/api/v1/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    try:
        if STRIPE_WEBHOOK_SECRET:
            event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
        else:
            event = json.loads(payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        
        print("\n--- 📦 WEBHOOK REÇU ---")
        stripe_id = session.get('id')
        amount = session.get('amount_total', 0) / 100
        customer_details = session.get('customer_details', {}) or {}
        shipping = session.get('shipping_details', {}) or {}
        
        # --- LOGIQUE DE SECOURS (FALLBACK) ---
        # 1. On cherche d'abord dans shipping_details
        address_data = shipping.get('address')
        
        # 2. Si vide, on prend l'adresse de facturation dans customer_details
        if not address_data and customer_details.get('address'):
            print("⚠️ Shipping vide, utilisation de l'adresse de facturation.")
            address_data = customer_details.get('address')
            
        # Si toujours vide, on met un objet vide pour éviter le crash
        if not address_data:
            address_data = {}

        print(f"📍 Adresse finale capturée : {address_data}")
        # -------------------------------------

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
        db.commit()
        print(f"💰 Commande sauvegardée.\n")

    return {"status": "success"}

@app.post("/api/v1/seed")
def seed_database(db: Session = Depends(get_db)):
    db.query(ProductModel).delete()
    products = [
        ProductModel(name="iPhone 15 Pro", price=1299.0, category="Smartphone", image_url="https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800", description="Le titane rencontre la puissance."),
        ProductModel(name="MacBook Air M2", price=1499.0, category="Ordinateur", image_url="https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=800", description="Incroyablement fin."),
        ProductModel(name="Sony WH-1000XM5", price=349.0, category="Audio", image_url="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800", description="Réduction de bruit."),
        ProductModel(name="Café de Spécialité", price=19.90, category="Lifestyle", image_url="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800", description="Grains 100% Arabica."),
        ProductModel(name="Montre Connectée", price=299.0, category="Wearable", image_url="https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800", description="Santé et sport."),
    ]
    db.add_all(products)
    db.commit()
    return {"message": "DB reset & seeded"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)