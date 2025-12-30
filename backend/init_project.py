import os
from pathlib import Path

def init_structure():
    print("🚀 Initialisation de la structure du backend...")
    
    # 1. Liste des dossiers à créer
    directories = [
        "app",
        "app/core",
        "app/models",
        "app/api",
        "app/api/v1" # Pour anticiper le versioning
    ]

    # 2. Liste des fichiers vides (__init__.py rend le dossier importable par Python)
    files = [
        "app/__init__.py",
        "app/core/__init__.py",
        "app/models/__init__.py",
        "app/api/__init__.py",
        "app/api/v1/__init__.py",
        # On prépare aussi les fichiers où tu colleras le code ensuite
        "app/core/database.py",
        "app/models/product.py",
    ]

    # Création des dossiers
    for directory in directories:
        dir_path = Path(directory)
        dir_path.mkdir(parents=True, exist_ok=True)
        print(f"✅ Dossier : {directory}")

    # Création des fichiers
    for file in files:
        file_path = Path(file)
        if not file_path.exists():
            file_path.touch() # C'est l'équivalent Python de la commande 'touch'
            print(f"✅ Fichier : {file}")
        else:
            print(f"ℹ️  Existe déjà : {file}")

    print("\n🎉 Structure terminée ! Tu peux maintenant copier le code dans les fichiers.")

if __name__ == "__main__":
    init_structure()