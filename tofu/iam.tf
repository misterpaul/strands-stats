
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

# --- NOTE on run.invoker permission ---
# The 'roles/run.invoker' permission for the Eventarc service agent creates a
# circular dependency if defined here. It's best practice to grant this
# with a gcloud command after the first 'tofu apply'. An `outputs.tf` file
# can generate the exact command needed.