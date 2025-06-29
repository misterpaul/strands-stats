# strands-stats Architecture

# Accounts

Accounts involved in this:

* Admin account - set up new accounts - Chrome
* Developer account (mrp) - set up back-end infrastructure - Chrome Incognito
  * Storage Admin on the project
  * GitHub account owner
* Email account (games) - safari
  * App Script owner

# Email
A special mailbox setup for account games@sennovation.com to recieve emails. An Apps Script runs every N minutes (N can be set)

Using a dedicated mailbox is important because, according to Google Gemini Pro, we can't set up a special minimum-permissions service account for the script. So we want this user account to do nothing but handle these emails.

> An Apps Script with a standard time-driven trigger runs under the identity of the user who creates it. It does not use a separate service account for its execution context.
> 
> When you set up the trigger and authorize the script, you are giving that specific script permission to act on your behalf, using your user account's permissions to read/modify your Gmail and to write to Google Cloud Storage.
> 
> This makes the initial setup easier since you don't have to manage service account keys, but it's a critical security point to understand. The best practice is to have the script set up by a dedicated user account (e.g., automation@your-workspace-domain.com) rather than a personal or admin account, to limit its scope.

Scripts are managed from script.google.com

# Storage Bucket

**snvn-strands-stats-tf**: this appears to be a bucket I created for storing terraform state. I will probably delete this, as for this project, I think Terraform may be overkill, especially since it isn't great for deploying Cloud Functions.

**snvn-emails** 
* uniform bucket policy
* 7 day soft delete
* enforce not public
* added lifecycle policy to delete any object over 30 days old. Should reduce this once things are up and running smoothly. Cloud Function might also delete.
* Region: central1 (low cost, low CO2 (east1 has higher CO2))

