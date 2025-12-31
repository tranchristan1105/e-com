# On utilise Python 3.11 (version légère)
FROM python:3.11-slim

# Dossier de travail
WORKDIR /app

# Installation des outils système
RUN apt-get update && apt-get install -y gcc

# Copie des dépendances
COPY requirements.txt .

# Installation des libs Python
RUN pip install --no-cache-dir -r requirements.txt

# Copie du code
COPY . .

# --- CORRECTION ICI ---
# Cloud Run utilise le port 8080 par défaut
EXPOSE 8080

# On utilise "exec" et la variable d'environnement PORT (avec 8080 par défaut)
CMD exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}