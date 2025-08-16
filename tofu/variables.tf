# variables.tf

variable "environment" {
  type        = string
  description = "Environment we are configuring"
  default     = "dev"
}

variable "project_id" {
  type        = string
  description = "The ID of the Google Cloud project."
  default     = "strands-stats"
}

variable "project_number" {
  type        = string
  description = "The number of the Google Cloud project."
}

variable "oauth_app_title" {
  description = "The application title displayed on the OAuth consent screen."
  type        = string
  default     = "Game Stats"
}

variable "oauth_support_email" {
  description = "The support email address displayed on the OAuth consent screen."
  type        = string
}


variable "region" {
  type        = string
  description = "The region where resources will be deployed."
  default     = "us-central1"
}

variable "function_name" {
  type        = string
  description = "The base name of the Cloud Function (environment suffix will be added)."
  default     = "dataloader"
}

variable "entry_point" {
  type        = string
  description = "The name of the exported function in the source code."
  default     = "dataloader"
}

variable "cloud_function_svc_acct_name" {
  type        = string
  description = "The base name for the function's service account (environment suffix will be added)."
  default     = "data-loader"
}

variable "emails_bucket_name" {
  type        = string
  description = "Base name for the GCS bucket that receives incoming emails."
  default     = "snvn-emails"
}

variable "success_bucket_name" {
  type        = string
  description = "Base name for the GCS bucket to store successfully processed emails."
  default     = "snvn-emails-success"
}

variable "failure_bucket_name" {
  type        = string
  description = "Base name for the GCS bucket to store failed emails."
  default     = "snvn-emails-failures"
}

variable "firestore_collection" {
  type        = string
  description = "The name of the Firestore collection to write data to."
  default     = "strands"
}

variable "firestore_database_id" {
  type        = string
  description = "The base ID of the Firestore database to use (environment suffix will be added)."
  default     = "games"
}

variable "billing_account_id" {
  type        = string
  description = "The ID of the billing account to associate the budget with."

}

variable "budget_alert_emails" {
  type        = list(string)
  description = "A list of email addresses to receive budget alerts."
  default     = []
}
