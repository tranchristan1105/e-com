# On utilise Python 3.11 (version légère)
FROM python:3.11-slim

# Dossier de travail dans le conteneur
WORKDIR /app

# On installe les outils système nécessaires pour compiler certaines libs
RUN apt-get update && apt-get install -y gcc

# On copie d'abord les requirements pour que Docker les garde en mémoire (cache)
COPY requirements.txt .

# On installe les librairies Python
RUN pip install --no-cache-dir -r requirements.txt

# On copie tout le reste du code
COPY . .

# On expose le port 8000
EXPOSE 8000

# La commande de démarrage
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]