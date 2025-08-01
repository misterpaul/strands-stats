# Configure the Google Cloud provider
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.6.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = ">= 2.2.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region

  # Required when authenticating with user credentials (ADC) for APIs like Billing.
  user_project_override = true
  billing_project       = var.project_id
}