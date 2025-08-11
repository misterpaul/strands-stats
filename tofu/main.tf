# --- Create the Cloud Function ---

# First, we need to zip up our source code.
data "archive_file" "source" {
  type        = "zip"
  # Assumes source code is in a 'cloud_fn_source' directory alongside the 'tofu' directory
  source_dir  = "${path.module}/../cloud_fn_source/"
  output_path = "${path.module}/cloud_fn_source.zip"
  # Exclude development dependencies to keep the zip small
  excludes = ["node_modules/", ".git/"]
}


# Upload the zipped source code to the source bucket
resource "google_storage_bucket_object" "source_object" {
  name   = "source.zip#${data.archive_file.source.output_md5}" # Use hash to trigger updates on code change
  bucket = google_storage_bucket.source_bucket.name
  source = data.archive_file.source.output_path
}

resource "google_cloudfunctions2_function" "function" {
  name     = "${var.function_name}-${var.environment}"
  location = var.region

  build_config {
    runtime     = "nodejs20"
    entry_point = var.entry_point
    source {
      storage_source {
        bucket = google_storage_bucket.source_bucket.name
        object = google_storage_bucket_object.source_object.name
      }
    }
  }

  service_config {
    max_instance_count = 3
    min_instance_count = 0
    available_memory   = "256Mi"
    timeout_seconds    = 60
    service_account_email = google_service_account.function_sa.email
    environment_variables = {
      EMAILS_BUCKET        = google_storage_bucket.app_buckets["emails"].name
      SUCCESS_BUCKET       = google_storage_bucket.app_buckets["success"].name
      FAILURE_BUCKET       = google_storage_bucket.app_buckets["failures"].name
      FIRESTORE_COLLECTION = var.firestore_collection
      GCLOUD_PROJECT       = var.project_id
      FIRESTORE_DATABASE_ID = "${var.firestore_database_id}-${var.environment}"
    }
  }

  event_trigger {
    trigger_region = var.region
    event_type     = "google.cloud.storage.object.v1.finalized"
    retry_policy   = "RETRY_POLICY_RETRY"
    # This is the critical missing piece. We must explicitly tell the trigger
    # to use our function's service account to invoke the function.
    service_account_email = google_service_account.function_sa.email
    event_filters {
      attribute = "bucket"
      value     = google_storage_bucket.app_buckets["emails"].name
    }
  }

  # Ensure APIs are enabled before creating the function
  depends_on = [
    google_project_service.apis,
    # Explicitly wait for the GCS service agent to get pub/sub publisher permissions.
    google_project_iam_member.gcs_sa_pubsub_publisher,
    google_project_iam_member.eventarc_receiver,
  ]
}
