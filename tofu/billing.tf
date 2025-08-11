### Google Billing Budget ###
# This is the most important guardrail for controlling costs.
# It will send alerts when spending thresholds are met.

data "google_billing_account" "account" {
  billing_account = var.billing_account_id
}

resource "google_billing_budget" "budget" {
  billing_account = data.google_billing_account.account.id
  display_name    = "Strands Stats Budget (${var.environment})"

  budget_filter {
    projects = ["projects/${var.project_number}"]
  }

  amount {
    # A small budget for this project. Adjust as needed.
    specified_amount {
      currency_code = "USD"
      units         = "10" # e.g., $10
    }
  }

  threshold_rules {
    threshold_percent = 0.9 # Alert at 90% of the budget
  }
}

