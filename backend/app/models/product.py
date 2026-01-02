from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from datetime import datetime
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    price = Column(Float)
    category = Column(String, index=True)
    image_url = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, index=True)
    user_id = Column(String, index=True)
    page_url = Column(String)
    metadata_json = Column(Text) # Utilisation de Text pour les longs JSON
    created_at = Column(DateTime, default=datetime.utcnow)

# --- NOUVEAU : Modèle Commande ---
class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    stripe_id = Column(String, unique=True, index=True) # ID de transaction Stripe
    customer_email = Column(String, index=True)
    customer_name = Column(String)
    total_amount = Column(Float)
    status = Column(String, default="paid") # paid, shipped, cancelled
    items_json = Column(Text) # Liste des produits achetés (stockée en texte JSON)
    shipping_address_json = Column(Text) # Adresse complète
    created_at = Column(DateTime, default=datetime.utcnow)