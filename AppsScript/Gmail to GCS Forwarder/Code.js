// Google Apps Script Code (Code.gs)
// Courtesy of Gemini
// Updated to include sender whitelist functionality

// --- CONFIGURATION ---
// 1. The name of the Google Cloud Storage bucket you created.
const GCS_BUCKET_NAME = 'snvn-emails'; 

// 2. The Gmail label to look for. Emails with this label will be processed.
//    Create this label in your Gmail settings. This is safer than using 'is:unread'.
//    For example: 'process-for-cloud-function'
const GMAIL_PROCESSING_LABEL = 'process-for-cloud-function';

// 3. The Gmail label to apply after an email has been successfully processed.
//    Create this label in your Gmail settings.
const GMAIL_PROCESSED_LABEL = 'processed-by-script';

// 4. The Gmail label to apply if an email has an invalid sender
//    Create this label in your Gmail settings.
const GMAIL_INVALID_SENDER = 'invalid-sender';

// 5. The Gmail label to apply if an email failed processing
//    Create this label in your Gmail settings.
const GMAIL_PROCESSING_ERROR = 'processing-error';

// 6. A list of sender email addresses that are allowed to be processed.
//    Emails from senders NOT in this list will be skipped.
const ALLOWED_SENDERS = [
  'jacky.doe@example.com',
  'jimmi.smith@example.com'
  // Add more authorized email addresses here
];

/**
 * @description This is the main function to be run by a time-based trigger.
 * It searches for emails with the specified label, saves them to GCS if the sender is allowed,
 * and then updates their labels.
 */
function processNewEmails() {
  // Confirm all required labels exist before starting.
  const labelArray = [GMAIL_PROCESSING_LABEL, GMAIL_PROCESSED_LABEL, GMAIL_INVALID_SENDER, GMAIL_PROCESSING_ERROR];
  for (const labelName of labelArray) {
    // Use the built-in GmailApp service which returns null if a label is not found, instead of throwing an error.
    const label = GmailApp.getUserLabelByName(labelName);
    if (!label) {
      console.error(`FATAL: Gmail label "${labelName}" not found. Please create it in your Gmail settings before running the script.`);
      return; // Stop execution if a required label is missing.
    }
  }
  
  // Create a lowercased version of the allowed senders list for case-insensitive comparison.
  const allowedSendersLower = ALLOWED_SENDERS.map(email => email.toLowerCase());

  // Search for threads with the processing label but not the processed label
  const query = `label:${GMAIL_PROCESSING_LABEL} -label:${GMAIL_PROCESSED_LABEL}`;
  const threads = GmailApp.search(query);

  if (threads.length === 0) {
    console.log("No new emails to process.");
    return;
  }

  console.log(`Found ${threads.length} new email thread(s) to process.`);

  // Get an OAuth2 token to authorize the GCS request
  const accessToken = ScriptApp.getOAuthToken();

  threads.forEach(thread => {
    let wasAnythingUploaded = false; // Flag to track if we uploaded any message from this thread
    const messages = thread.getMessages();

    messages.forEach(message => {
      // Safeguard: skip if the thread has already been marked as processed.
      if (message.getThread().getLabels().some(label => label.getName() === GMAIL_PROCESSED_LABEL)) {
          return; 
      }

      try {
        // Get the sender's email address, extracting it from "Name <email@addr.com>" format if necessary
        const from = message.getFrom();
        let senderEmail;
        const emailMatch = from.match(/<(.+)>/);
        if (emailMatch && emailMatch[1]) {
          senderEmail = emailMatch[1];
        } else {
          senderEmail = from.trim(); // Assume the 'from' field is just the email, trim whitespace
        }

        // Check if the sender is in the allowed list
        if (allowedSendersLower.includes(senderEmail.toLowerCase())) {
          console.log(`Processing message: "${message.getSubject()}" (ID: ${message.getId()}) from allowed sender.`);

          // Get the raw RFC 822 formatted email content
          const rawContent = message.getRawContent();

          // Create a unique file name for the object in GCS
          const fileName = `${message.getDate().toISOString()}_${message.getId()}.eml`;

          // Upload the file to Google Cloud Storage
          uploadToGCS(fileName, rawContent, accessToken);

          console.log(`Successfully uploaded ${fileName} to GCS.`);
          wasAnythingUploaded = true; // Set flag to true as we've processed a file.
          
        } else {
          console.log(`Skipping message from "${senderEmail}" because the sender is not in the allowed list. Subject: "${message.getSubject()}"`);
          thread.addLabel(GmailApp.getUserLabelByName(GMAIL_INVALID_SENDER));
        }
      } catch (e) {
        console.error(`Failed to process message ID ${message.getId()}. Error: ${e.toString()}`);
        thread.addLabel(GmailApp.getUserLabelByName(GMAIL_PROCESSING_ERROR));
      }
    }); // End of messages loop

    // After checking all messages, update the thread's labels.
    if (wasAnythingUploaded) {
      thread.addLabel(GmailApp.getUserLabelByName(GMAIL_PROCESSED_LABEL));
      console.log(`Marked thread "${thread.getFirstMessageSubject()}" as processed.`);
    } else {
      console.log(`No messages from allowed senders found in thread "${thread.getFirstMessageSubject()}". Removing processing label.`);
    }
    
    // Always remove the processing label to prevent the thread from being re-evaluated.
    thread.removeLabel(GmailApp.getUserLabelByName(GMAIL_PROCESSING_LABEL));
  }); // End of threads loop
}

/**
 * @description Uploads a file to Google Cloud Storage using the REST API.
 * @param {string} fileName The name of the file to create in GCS.
 * @param {string} fileContent The content of the file.
 * @param {string} accessToken The OAuth2 token for authorization.
 */
function uploadToGCS(fileName, fileContent, accessToken) {
  const url = `https://storage.googleapis.com/upload/storage/v1/b/${GCS_BUCKET_NAME}/o?uploadType=media&name=${encodeURIComponent(fileName)}`;
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'message/rfc822' // Standard MIME type for email files
  };
  const options = {
    method: 'post',
    headers: headers,
    payload: fileContent,
    muteHttpExceptions: true // Prevents script from stopping on error, lets us log it
  };
  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();
  const responseBody = response.getContentText();

  if (responseCode >= 200 && responseCode < 300) {
    console.log(`GCS Upload Success: ${responseBody}`);
  } else {
    throw new Error(`GCS Upload Failed. Response Code: ${responseCode}. Body: ${responseBody}`);
  }
}

/**
 * HOW TO SET THIS UP:
 * 1. Go to script.google.com and create a new project.
 * 2. Paste this entire code into the `Code.gs` file.
 * 3. Update the CONFIGURATION variables at the top, especially the new ALLOWED_SENDERS list.
 * 4. In Gmail, create the two labels you defined (e.g., 'process-for-cloud-function' and 'processed-by-script').
 * 5. In your Gmail settings, create a filter that applies the 'process-for-cloud-function' label to incoming mail you want to process.
 * 6. In the Apps Script Editor, go to "Services" (+ icon) and add the "Gmail API".
 * 7. Go to "Project Settings" (gear icon) and check "Show 'appsscript.json' manifest file in editor".
 * 8. Edit the `appsscript.json` file to add the required Cloud Platform scope:
 * "oauthScopes": [
 * "https://www.googleapis.com/auth/gmail.readonly",
 * "https://www.googleapis.com/auth/gmail.modify",
 * "https://www.googleapis.com/auth/script.external_request",
 * "https://www.googleapis.com/auth/cloud-platform" <--- ADD THIS LINE
 * ]
 * 9. Go to "Triggers" (clock icon) in the left menu.
 * 10. Click "Add Trigger", choose `processNewEmails` to run, select "Time-driven" as the event source, 
 * and set it to run on a "Minutes timer" (e.g., every 1, 5, or 10 minutes).
 * 11. Save the trigger. It will ask you to authorize the script. Follow the prompts.
 */