terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 4.51.0"
    }
    random = {
      source  = "hashicorp/random"
      version = ">= 3.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# 1. ACTIVER LES APIs GOOGLE (Indispensable)
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",              # Cloud Run
    "sqladmin.googleapis.com",         # Cloud SQL
    "artifactregistry.googleapis.com", # Stockage images Docker
    "iam.googleapis.com",              # Gestion des droits
    "cloudbuild.googleapis.com"        # CI/CD
  ])
  service            = each.key
  disable_on_destroy = false
}

# 2. CRÉER LE DÉPÔT D'IMAGES DOCKER
resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = "ecommerce-repo"
  description   = "Depot Docker pour E-commerce App"
  format        = "DOCKER"
  depends_on    = [google_project_service.apis]
}

# 3. CRÉER LE MOT DE PASSE DE LA DB (Généré aléatoirement)
resource "random_password" "db_password" {
  length           = 16
  special          = false # Pas de caractères spéciaux pour éviter les soucis d'URL
}

# 4. CRÉER LA BASE DE DONNÉES (Cloud SQL Postgres)
resource "google_sql_database_instance" "main" {
  name             = "ecommerce-db-${random_id.db_suffix.hex}"
  database_version = "POSTGRES_15"
  region           = var.region
  depends_on       = [google_project_service.apis]

  settings {
    # "db-f1-micro" est la moins chère (environ 9€/mois, souvent gratuite en tier free)
    tier = "db-f1-micro" 
    
    ip_configuration {
      ipv4_enabled = true # Accès public (sécurisé par user/pass)
      
      # Autoriser l'accès depuis n'importe où (0.0.0.0/0) pour le développement.
      # EN PROD : Il faudrait restreindre aux IPs de Cloud Run uniquement.
      authorized_networks {
        name  = "all"
        value = "0.0.0.0/0"
      }
    }
  }
  
  # Pour éviter de supprimer la DB par erreur via Terraform
  deletion_protection = false 
}

resource "random_id" "db_suffix" {
  byte_length = 4
}

# Création de l'utilisateur DB
resource "google_sql_user" "users" {
  name     = "ecommerce_user"
  instance = google_sql_database_instance.main.name
  password = random_password.db_password.result
}

# Création de la database interne
resource "google_sql_database" "database" {
  name     = "ecommerce_prod"
  instance = google_sql_database_instance.main.name
}