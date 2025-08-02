# outputs.tf

# Attempt to read the IAM policy of the function's underlying Cloud Run service.
# This will fail on the first 'tofu apply' when the service doesn't exist yet,
# which is handled gracefully by the `try()` function in the locals block.
data "google_cloud_run_service_iam_policy" "invoker_policy" {
  location = google_cloudfunctions2_function.function.location
  project  = google_cloudfunctions2_function.function.project
  service  = google_cloudfunctions2_function.function.name
}

locals {
  # Construct the full member string for the Eventarc Service Agent
  eventarc_sa_member = "serviceAccount:service-${data.google_project.project.number}@gcp-sa-eventarc.iam.gserviceaccount.com"

  # Use try() to gracefully handle the data source failing on the first run.
  # If it fails, we assume an empty policy, meaning the permission does not exist.
  policy_data = try(data.google_cloud_run_service_iam_policy.invoker_policy.policy_data, "{}")
  policy      = jsondecode(local.policy_data)

  # Find the bindings for the 'run.invoker' role. Default to an empty list.
  invoker_bindings = [
    for b in try(local.policy.bindings, []) : b if b.role == "roles/run.invoker"
  ]

  # Flatten the list of all members who have the 'run.invoker' role.
  invoker_members = flatten([
    for b in local.invoker_bindings : b.members
  ])

  # Check if the Eventarc SA is already in the list of invokers.
  permission_exists = contains(local.invoker_members, local.eventarc_sa_member)
}

output "function_name" {
  value       = google_cloudfunctions2_function.function.name
  description = "The name of the deployed Cloud Function."
}

output "function_uri" {
  value       = google_cloudfunctions2_function.function.service_config[0].uri
  description = "The URI of the underlying Cloud Run service."
}

output "source_code_bucket" {
  value       = google_storage_bucket.source_bucket.name
  description = "The bucket where the function's source code is stored."
}

# --- NEW: Output the command to grant invoker permissions ---
# This command needs to be run once after the first successful 'tofu apply'.
output "grant_invoker_permission_command" {
  value = local.permission_exists ? "INFO: Cloud Run Invoker permission for Eventarc is already configured." : <<EOT
This command needs to be run to grant Cloud Run Invoker permission to EventArc:

gcloud run services add-iam-policy-binding ${google_cloudfunctions2_function.function.name} \
  --project=${var.project_id} \
  --region=${var.region} \
  --member="${local.eventarc_sa_member}" \
  --role="roles/run.invoker"
EOT
  description = "Command to grant Eventarc permission to invoke the Cloud Run service. If this shows an INFO message, the permission is already set."
}
