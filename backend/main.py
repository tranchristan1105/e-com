from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
import json
import time
import stripe
import os

# --- CONFIGURATION & DEBUG ---
stripe.api_key = os.getenv("STRIPE_API_KEY")
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
print(frontend_url)
# Vérification au démarrage
if not stripe.api_key:
    print("❌ ERREUR CRITIQUE : La clé Stripe (STRIPE_API_KEY) est vide ou manquante !")
else:
    print(f"✅ Clé Stripe chargée : {stripe.api_key[:4]}...****")

print(f"✅ Frontend URL : {frontend_url}")

from app.core.database import engine, Base, get_db
from app.models.product import Product as ProductModel, AnalyticsEvent as EventModel

# --- Init DB ---
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

# --- Schemas ---
class ProductSchema(BaseModel):
    id: int
    name: str
    price: float
    category: str
    image_url: str
    description: Optional[str] = None
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

# --- Routes ---
@app.get("/")
def read_root():
    return {"status": "online", "mode": "millionaire"}

@app.get("/api/v1/products/{product_id}", response_model=ProductSchema)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    return product

# --- CORRECTION ICI : RESTAURATION DES FILTRES ---
@app.get("/api/v1/products", response_model=List[ProductSchema])
def get_products(
    q: Optional[str] = None, 
    category: Optional[str] = None, 
    db: Session = Depends(get_db)
):
    query = db.query(ProductModel)
    
    # Filtre par texte (nom ou description)
    if q:
        search = f"%{q}%"
        query = query.filter(
            (ProductModel.name.ilike(search)) | 
            (ProductModel.description.ilike(search))
        )
    
    # Filtre par catégorie
    if category and category != "Tout":
        query = query.filter(ProductModel.category == category)
        
    return query.all()

@app.post("/api/v1/analytics")
def track_event(event: AnalyticsSchema, db: Session = Depends(get_db)):
    try:
        metadata_str = json.dumps(event.metadata)
        db_event = EventModel(
            event_type=event.event_type,
            user_id=event.user_id,
            page_url=event.page_url,
            metadata_json=metadata_str
        )
        db.add(db_event)
        db.commit()
        return {"status": "recorded"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

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
            if name and name != 'Inconnu':
                product_counts[name] = product_counts.get(name, 0) + 1
        except:
            continue
    sorted_products = dict(sorted(product_counts.items(), key=lambda item: item[1], reverse=True)[:10])

    step_1 = stats_by_type.get('page_view', 0)
    step_2 = stats_by_type.get('view_item', 0)
    step_3 = stats_by_type.get('add_to_cart', 0)
    funnel_data = {"1_visitors": step_1, "2_interested": step_2, "3_converted": step_3}

    recent_logs = db.query(EventModel).order_by(EventModel.created_at.desc()).limit(20).all()
    
    return {
        "summary": {"total_events": total, "breakdown": stats_by_type, "top_products": sorted_products, "funnel": funnel_data},
        "recent_logs": recent_logs
    }

# --- ROUTE DE PAIEMENT (STRIPE) ---
@app.post("/api/v1/create-checkout-session")
def create_checkout_session(cart: CheckoutSchema):
    try:
        if not stripe.api_key:
             raise Exception("Clé Stripe non configurée !")

        line_items = []
        for item in cart.items:
            line_items.append({
                'price_data': {
                    'currency': 'eur',
                    'product_data': {'name': item.name},
                    'unit_amount': int(item.price * 100),
                },
                'quantity': 1,
            })

        # Utilisation de la variable FRONTEND_URL pour la redirection
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url=f'{frontend_url}/success?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=f'{frontend_url}/cancel',
        )
        
        return {"checkout_url": checkout_session.url}
    
    except Exception as e:
        print(f"Stripe Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/seed")
def seed_database(db: Session = Depends(get_db)):
    db.query(ProductModel).delete()
    products = [
        ProductModel(name="iPhone 15 Pro", price=1299.0, category="Smartphone", image_url="https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800&auto=format&fit=crop", description="Le titane rencontre la puissance."),
        ProductModel(name="MacBook Air M2", price=1499.0, category="Ordinateur", image_url="https://images.unsplash.com/photo-1517336714731-489689fd1ca4?q=80&w=800&auto=format&fit=crop", description="Incroyablement fin."),
        ProductModel(name="Sony WH-1000XM5", price=349.0, category="Audio", image_url="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop", description="Réduction de bruit."),
        ProductModel(name="Café de Spécialité", price=19.90, category="Lifestyle", image_url="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop", description="Grains 100% Arabica."),
        ProductModel(name="Montre Connectée", price=299.0, category="Wearable", image_url="https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=800&auto=format&fit=crop", description="Santé et sport."),
    ]
    db.add_all(products)
    db.commit()
    return {"message": "Base de données mise à jour !"}

@app.get("/api/v1/debug-config")
def debug_config():
    """Route secrète pour vérifier la configuration en production"""
    return {
        "frontend_url_detected": os.getenv("FRONTEND_URL"),
        "frontend_url_default": "http://localhost:5173",
        "final_url_used": FRONTEND_URL,
        "stripe_key_masked": stripe.api_key[:8] + "..." if stripe.api_key else "None"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)