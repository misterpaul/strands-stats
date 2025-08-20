# Manages the App Engine application for the project.

# First, enable the App Engine Admin API for the project. This is required
# to create and manage App Engine applications.
resource "google_project_service" "appengine_api" {
  project = var.project_id
  service = "appengine.googleapis.com"
  # Do not disable the API on destroy, as it can have unintended consequences.
  disable_on_destroy = false
}

# This resource enables the App Engine application within your GCP project.
# It can only be created once per project. The location cannot be changed
# after it has been set.
#
# NOTE on Deletion: App Engine applications cannot be deleted from a project
# without deleting the entire project. Running `tofu destroy` will remove this
# resource from the state file, but the App Engine application will remain
# in your GCP project. It can be disabled via the gcloud CLI.
resource "google_app_engine_application" "app" {
  project     = var.project_id
  location_id = var.region
  # For this project, we don't need to configure database or feature settings.
}
