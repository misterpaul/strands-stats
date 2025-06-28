// Google Apps Script Code (Code.gs)
// Courtesy of Gemini

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


/**
 * @description This is the main function to be run by a time-based trigger.
 * It searches for emails with the specified label, saves them to GCS,
 * and then updates their labels.
 */
function processNewEmails() {
  const processingLabel = Gmail.Users.Labels.get('me', GMAIL_PROCESSING_LABEL);
  if (!processingLabel) {
    console.error(`Error: Processing label "${GMAIL_PROCESSING_LABEL}" not found. Please create it in Gmail.`);
    return;
  }

  const processedLabel = Gmail.Users.Labels.get('me', GMAIL_PROCESSED_LABEL);
  if (!processedLabel) {
    console.error(`Error: Processed label "${GMAIL_PROCESSED_LABEL}" not found. Please create it in Gmail.`);
    return;
  }
  
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
    const messages = thread.getMessages();
    messages.forEach(message => {
      try {
        // Double-check this specific message hasn't been processed
        if (message.getThread().getLabels().some(label => label.getName() === GMAIL_PROCESSED_LABEL)) {
            return; // Skip if already processed
        }

        console.log(`Processing message: "${message.getSubject()}" (ID: ${message.getId()})`);

        // Get the raw RFC 822 formatted email content
        const rawContent = message.getRawContent();

        // Create a unique file name for the object in GCS
        const fileName = `${message.getDate().toISOString()}_${message.getId()}.eml`;

        // Upload the file to Google Cloud Storage
        uploadToGCS(fileName, rawContent, accessToken);

        // Mark as processed by removing the old label and adding the new one
        thread.removeLabel(GmailApp.getUserLabelByName(GMAIL_PROCESSING_LABEL));
        thread.addLabel(GmailApp.getUserLabelByName(GMAIL_PROCESSED_LABEL));
        
        console.log(`Successfully processed and moved ${fileName} to GCS.`);

      } catch (e) {
        console.error(`Failed to process message ID ${message.getId()}. Error: ${e.toString()}`);
        // Consider applying an "error" label here
      }
    });
  });
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
 * 3. Update the CONFIGURATION variables at the top.
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
