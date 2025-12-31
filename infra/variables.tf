variable "project_id" {
  description = "L'ID de ton projet Google Cloud (PAS le nom, l'ID unique)"
  type        = string
}

variable "region" {
  description = "La région GCP (ex: europe-west1 pour la Belgique, europe-west9 pour Paris)"
  type        = string
  default     = "europe-west9" # Paris
}