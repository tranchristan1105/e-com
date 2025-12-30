from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import time # <--- AJOUTER CET IMPORT
from sqlalchemy.exc import OperationalError # <--- AJOUTER CET IMPORT
import json

# Import des modules internes (assurez-vous d'avoir exécuté init_project.py avant)
from app.core.database import engine, Base, get_db
from app.models.product import Product as ProductModel, AnalyticsEvent as EventModel

# --- Initialisation de la DB ---
# Crée les tables automatiquement (sql_app.db en local)
while True:
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Base de données connectée et tables créées !")
        break
    except Exception as e:
        print("⏳ La Base de données démarre... on patiente 3 secondes.")
        time.sleep(3)

app = FastAPI(title="E-commerce Cloud Native API")

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Schémas Pydantic ---
class ProductSchema(BaseModel):
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

# --- Routes API ---

@app.get("/")
def read_root():
    return {"status": "online", "message": "Backend E-commerce opérationnel"}

@app.post("/api/v1/products", response_model=ProductSchema)
def create_product(product: ProductSchema, db: Session = Depends(get_db)):
    db_product = ProductModel(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.get("/api/v1/products", response_model=List[ProductSchema])
def get_products(db: Session = Depends(get_db)):
    return db.query(ProductModel).all()

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
        print(f"Erreur tracking: {e}")
        return {"status": "error", "detail": str(e)}

@app.post("/api/v1/seed")
def seed_database(db: Session = Depends(get_db)):
    if db.query(ProductModel).first():
        return {"message": "La base de données contient déjà des données."}
    
    products = [
        ProductModel(name="Smartphone Pro X", price=999.0, category="High-Tech", image_url="https://via.placeholder.com/150", description="Le dernier cri."),
        ProductModel(name="Laptop UltraSlim", price=1299.0, category="Informatique", image_url="https://via.placeholder.com/150", description="Puissant."),
        ProductModel(name="Casque Audio 360", price=250.0, category="Audio", image_url="https://via.placeholder.com/150", description="Immersion totale."),
        ProductModel(name="Café Arabica Bio", price=15.90, category="Alimentation", image_url="https://via.placeholder.com/150", description="Réveil en douceur."),
    ]
    db.add_all(products)
    db.commit()
    return {"message": "4 produits ajoutés !"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)