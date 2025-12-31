output "db_connection_name" {
  value       = google_sql_database_instance.main.connection_name
  description = "Nom de connexion de l'instance (pour Cloud Run)"
}

output "db_public_ip" {
  value       = google_sql_database_instance.main.public_ip_address
  description = "Adresse IP publique de la base de données"
}

output "db_user" {
  value = google_sql_user.users.name
}

output "db_password" {
  value       = random_password.db_password.result
  sensitive   = true # Masqué dans les logs par défaut
  description = "Mot de passe généré pour la base de données"
}

output "artifact_repository" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.repository_id}"
  description = "URL du dépôt Docker"
}