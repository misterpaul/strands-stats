# --- Create GCS Buckets ---

# Bucket for the zipped source code for the function
resource "google_storage_bucket" "source_bucket" {
  name          = "${var.project_id}-function-source-${var.environment}"
  location      = var.region
  # Guardrail: Only allow force_destroy in the 'dev' environment.
  force_destroy               = var.environment == "dev" ? true : false
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"
}

# A map to define the application buckets
locals {
  app_buckets = {
    emails   = "${var.emails_bucket_name}-${var.environment}"
    success  = "${var.success_bucket_name}-${var.environment}"
    failures = "${var.failure_bucket_name}-${var.environment}"
  }
}

# Create the application buckets using a for_each loop for consistency
resource "google_storage_bucket" "app_buckets" {
  for_each = local.app_buckets

  name     = each.value
  location      = var.region

  # --- Cost & Security Best Practices ---
  # Use a cheaper storage class for archival buckets.
  # The 'emails' bucket needs Standard for immediate function access.
  storage_class = each.key == "emails" ? "STANDARD" : "NEARLINE"

  # Guardrail: Only allow force_destroy in the 'dev' environment.
  force_destroy = var.environment == "dev" ? true : false

  # Guardrail: Enforce uniform access and prevent public exposure.
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced" # Strongest guardrail against public exposure.

  # Cost Control: Retain deleted objects for 7 days for recovery.
  soft_delete_policy {
    retention_duration_seconds = 604800 # 7 days
  }

  # Cost Control: More aggressive lifecycle rule for the incoming emails bucket.
  lifecycle_rule {
    # This rule only applies to the 'emails' bucket.
    condition {
      matches_storage_class = ["STANDARD"]
      age                   = 7 # Delete incoming emails after 7 days.
    }
    action {
      type = "Delete"
    }
  }

  # Cost Control: Lifecycle rules for the success/failure buckets.
  lifecycle_rule {
    # This rule only applies to the non-email buckets.
    condition {
      matches_storage_class = ["NEARLINE"]
      age                   = 30 # Transition to even cheaper storage after 30 days.
    }
    action {
      type          = "SetStorageClass"
      storage_class = "ARCHIVE"
    }
  }

  lifecycle_rule {
    # This rule only applies to the non-email buckets.
    condition {
      matches_storage_class = ["ARCHIVE"]
      age                   = 90 # Delete from archive after 90 days.
    }
    action {
      type = "Delete"
    }
  }
}
