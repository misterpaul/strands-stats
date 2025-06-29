# Request

I've never used Apps Script. Walk me through setting it up in my Google Workspace Account. Does it run as me, or can I create a service account that runs it with limited permissions?

# Response

Of course. I'd be happy to walk you through the setup process. It's a great question about how Apps Script runs, as its security model is a bit different from other Google Cloud services.

To answer your main question directly: An Apps Script with a standard time-driven trigger runs under the identity of the user who creates it. It does not use a separate service account for its execution context.

When you set up the trigger and authorize the script, you are giving that specific script permission to act on your behalf, using your user account's permissions to read/modify your Gmail and to write to Google Cloud Storage.

This makes the initial setup easier since you don't have to manage service account keys, but it's a critical security point to understand. The best practice is to have the script set up by a dedicated user account (e.g., automation@your-workspace-domain.com) rather than a personal or admin account, to limit its scope.

Here is a detailed, step-by-step guide to get it all working.

## Google Apps Script Setup: A Step-by-Step Guide
This guide will walk you through setting up the provided Apps Script to automatically forward emails from a Google Workspace Gmail account to a Google Cloud Storage (GCS) bucket.

Step 1: Create the Apps Script Project
Go to the Google Apps Script dashboard: script.google.com.

In the top-left corner, click "+ New project".

Delete the default function myFunction() {} code in the editor window.

Copy the entire code from the "Google Apps Script: Forward Gmail to GCS" artifact and paste it into the editor.

At the top, click "Untitled project" and give it a descriptive name, like "Gmail to GCS Forwarder". Click "Rename".

Step 2: Configure the Script Variables
In the code editor, update the three constants at the top of the script:

GCS_BUCKET_NAME: Change 'your-email-landing-zone-bucket' to the exact name of the Google Cloud Storage bucket you created to receive the emails.

GMAIL_PROCESSING_LABEL: This is the label the script looks for. We recommend keeping it as 'process-for-cloud-function'.

GMAIL_PROCESSED_LABEL: This is the label the script applies after it's done. We recommend keeping it as 'processed-by-script'.

Step 3: Create Labels and a Filter in Gmail
The script relies on Gmail labels to know which emails to process.

Open the Gmail account where the script will run.

Create the Labels:

In the left-hand menu, scroll down and click "+ Create new label".

Create a label with the exact name you specified for GMAIL_PROCESSING_LABEL (e.g., process-for-cloud-function).

Create a second label with the name specified for GMAIL_PROCESSED_LABEL (e.g., processed-by-script).

Create the Filter:

Click the Settings gear icon at the top right and select "See all settings".

Go to the "Filters and Blocked Addresses" tab.

Click "Create a new filter".

Define the criteria for the emails you want to process. For example, you could filter by emails sent To a specific address (invoices@your-company.com) or from a specific sender. Be as specific as possible.

Click "Create filter".

On the next screen, check the box for "Apply the label:" and select your processing label (process-for-cloud-function).

Click "Create filter". Now, all new emails matching your criteria will automatically get the correct label.

Step 4: Link Script to Google Cloud Platform
To allow the script to write to your GCS bucket, you must associate it with your Google Cloud Project.

In the Apps Script editor, click the Project Settings (gear icon) on the left menu.

Scroll down to the "Google Cloud Platform (GCP) Project" section.

Click "Change project".

Paste in the Project Number of your GCP project (you can find this on the home page of your project at console.cloud.google.com).

Click "Set project".

Step 5: Add Required Services and Scopes
The script needs explicit permission to access Gmail and make external requests.

Add Gmail API Service:

On the left menu of the Apps Script editor, click the "+" icon next to "Services".

Find "Gmail API" in the list, select it, and click "Add".

Update the Manifest File:

Go back to Project Settings (gear icon).

Check the box for "Show 'appsscript.json' manifest file in editor".

Click the Editor ( < > icon) on the left menu. You will now see an appsscript.json file. Click to open it.

Add the "https://www.googleapis.com/auth/cloud-platform" scope to the oauthScopes list. The final list should look like this:

"oauthScopes": [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/script.external_request",
  "https://www.googleapis.com/auth/cloud-platform"
]

Step 6: Set Up the Time-Based Trigger
This final step automates the script.

On the left menu, click the Triggers (clock icon).

In the bottom right, click "+ Add Trigger".

Configure the trigger with the following settings:

Choose which function to run: processNewEmails

Choose which deployment should run: Head

Select event source: Time-driven

Select type of time-based trigger: Minutes timer

Select minute interval: Every 5 minutes (or Every minute for faster processing).

Click "Save".

The Authorization Prompt
The first time you save a trigger, Google will prompt you to authorize the script.

A window will pop up asking you to "Choose an account". Select the Google Workspace account you are using.

You will see a screen saying "Google hasn’t verified this app". This is normal for your own scripts. Click "Advanced" and then click "Go to [Your Script Name] (unsafe)".

A final screen will show you what the script wants permission to do (e.g., read/modify Gmail, connect to an external service). Review these and click "Allow".

Your trigger is now active! Every 5 minutes (or whatever interval you set), the script will run, look for new emails with the processing label, and forward them to your GCS bucket, where your Cloud Function will be waiting.
