### Firestore Databases ###
resource "google_firestore_database" "games_db" {
  project       = var.project_id
  name          = "games-${var.environment}"
  location_id   = var.region
  type          = "FIRESTORE_NATIVE"
  delete_protection_state = "DELETE_PROTECTION_DISABLED"
}

# Grant the function's service account access to Firestore
resource "google_project_iam_member" "function_sa_firestore_user" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.function_sa.email}"
}

