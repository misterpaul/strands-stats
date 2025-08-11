# outputs.tf

# The complex logic to generate a gcloud command has been removed.
# We now handle all permissions declaratively in iam.tf, which is a more robust
# and less confusing approach. These are simple outputs for referencing resources.

output "function_name" {
  value       = google_cloudfunctions2_function.function.name
  description = "The name of the deployed Cloud Function."
}

output "function_uri" {
  # The service_config block is a list, so we access the first element.
  # Using try() prevents errors on the initial plan before the resource exists.
  value       = try(google_cloudfunctions2_function.function.service_config[0].uri, "n/a")
  description = "The URI of the underlying Cloud Run service."
}

output "source_code_bucket" {
  value       = google_storage_bucket.source_bucket.name
  description = "The bucket where the function's source code is stored."
}

output "function_service_account" {
  value       = google_service_account.function_sa.email
  description = "The service account used by the Cloud Function."
}
