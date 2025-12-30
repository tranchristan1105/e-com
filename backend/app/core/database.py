from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# En local, on crée un fichier 'sql_app.db'. 
# Sur Google Cloud, on utilisera l'URL de PostgreSQL via une variable d'environnement.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

# Configuration spécifique pour SQLite (check_same_thread=False)
connect_args = {"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Fonction utilitaire pour récupérer la session DB dans chaque requête API
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()