#strands-stats Architecture

# Email
A special mailbox setup for account games@sennovation.com to recieve emails. An Apps Script runs every N minutes (N can be set)

Using a dedicated mailbox is important because, according to Google Gemini Pro, we can't set up a special minimum-permissions service account for the script. So we want this user account to do nothing but handle these emails.

> An Apps Script with a standard time-driven trigger runs under the identity of the user who creates it. It does not use a separate service account for its execution context.
> 
> When you set up the trigger and authorize the script, you are giving that specific script permission to act on your behalf, using your user account's permissions to read/modify your Gmail and to write to Google Cloud Storage.
> 
> This makes the initial setup easier since you don't have to manage service account keys, but it's a critical security point to understand. The best practice is to have the script set up by a dedicated user account (e.g., automation@your-workspace-domain.com) rather than a personal or admin account, to limit its scope.

Scripts are managed from script.google.com

