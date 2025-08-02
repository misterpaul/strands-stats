
# --- Create Service Accounts and Permissions ---

# Create a dedicated service account for the Cloud Function
resource "google_service_account" "function_sa" {
  account_id   = "${var.cloud_function_svc_acct_name}-${var.environment}"
  display_name = "Service Account for Email Processing Function"
}

# Grant the function's SA permission to access the application buckets using a for_each
resource "google_storage_bucket_iam_member" "bucket_access" {
  for_each = google_storage_bucket.app_buckets
  bucket   = each.value.name
  role     = "roles/storage.objectAdmin"
  member   = "serviceAccount:${google_service_account.function_sa.email}"
}

# Grant the function's SA permission to write to Firestore
resource "google_project_iam_member" "firestore_access" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.function_sa.email}"
}

# Grant the function's SA permission to receive Eventarc events
resource "google_project_iam_member" "eventarc_receiver" {
  project = var.project_id
  role    = "roles/eventarc.eventReceiver"
  member  = "serviceAccount:${google_service_account.function_sa.email}"
}

# Data source to get the project number for constructing the Eventarc SA email
data "google_project" "project" {
}

# Get the identity of the GCS service agent
data "google_storage_project_service_account" "gcs_sa" {
}

# --- Least Privilege for GCS Service Agent ---
# Grant the GCS service agent permission to publish Pub/Sub events in the project.
# This project-level permission is required by Eventarc to create GCS-triggered functions.
# While broader than a single topic, it is the standard and most reliable method.
resource "google_project_iam_member" "gcs_sa_pubsub_publisher" {
  project = var.project_id
  role   = "roles/pubsub.publisher"
  member = "serviceAccount:${data.google_storage_project_service_account.gcs_sa.email_address}"
}

# Grant the function's own service account permission to invoke the function.
# This is required because the Eventarc trigger, when created via the
# google_cloudfunctions2_function resource, uses the function's identity
# as the invoker, not the Eventarc service agent.
resource "google_cloud_run_service_iam_member" "function_self_invoker" {
  location = google_cloudfunctions2_function.function.location
  project  = google_cloudfunctions2_function.function.project
  service  = google_cloudfunctions2_function.function.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.function_sa.email}"
}