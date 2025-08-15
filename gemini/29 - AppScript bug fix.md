# Request

when I try to run the code from Apps Script, it fails with this:

plaintext: 4 lines selected
10:11:03 PM	Error	
GoogleJsonResponseException: API call to gmail.users.labels.get failed with error: Requested entity was not found.
(anonymous)	@ Code.gs:43
processNewEmails	@ Code.gs:42

# Response

Of course. This is a very common and subtle error when working with the advanced Gmail API in Apps Script.

The error Requested entity was not found happens because the API call Gmail.Users.Labels.get() does not return null when it can't find a label; instead, it throws an exception. Your code tries to check for a missing label with if (!label), but this line is never reached because the exception has already stopped the script.

The solution is to use the simpler, built-in GmailApp service, which is better suited for this task. The GmailApp.getUserLabelByName() method returns null if a label isn't found, which allows your validation check to work as you originally intended.

I've updated your Code.js file to use this more robust method. I also changed the loop from a forEach to a for...of loop. This is important because using return inside a forEach only exits the current iteration, not the main processNewEmails function. The for...of loop ensures the entire script stops if a required label is missing.

Here is the corrected code:

Code.js
-6
+7
 Show full code block 
 * and then updates their labels.
 */
function processNewEmails() {
  // confirm all labels exist
  // Confirm all required labels exist before starting.
  const labelArray = [GMAIL_PROCESSING_LABEL, GMAIL_PROCESSED_LABEL, GMAIL_INVALID_SENDER, GMAIL_PROCESSING_ERROR];
  labelArray.forEach(item => {
    const label = Gmail.Users.Labels.get('me', item);
  for (const labelName of labelArray) {
    // Use the built-in GmailApp service which returns null if a label is not found, instead of throwing an error.
    const label = GmailApp.getUserLabelByName(labelName);
    if (!label) {
      console.error(`Error: Processing label "${item}" not found. Please create it in Gmail.`);
      return;
      console.error(`FATAL: Gmail label "${labelName}" not found. Please create it in your Gmail settings before running the script.`);
      return; // Stop execution if a required label is missing.
    }
  });
  }
  
  // Search for threads with the processing label but not the processed label
  const query = `label:${GMAIL_PROCESSING_LABEL} -label:${GMAIL_PROCESSED_LABEL}`;

Please apply this change and run the script again. This should resolve the error and correctly validate that all your labels exist before processing any emails.

# Request

in lines 87-88 we validate that the sender's email is in the ALLOWED_SENDERS list. However, email is case insensitive, so make that check be case insensitive

# Response

Of course. You've spotted a classic email handling issue. Email addresses are case-insensitive, but a standard string comparison is not. Using .includes() directly could incorrectly reject an email from Paul@Example.com if the allowlist only contains paul@example.com.

The best way to fix this is to convert both the sender's email and the emails in your ALLOWED_SENDERS list to the same case (e.g., lowercase) before comparing them.

I've updated your Code.js to perform this case-insensitive check. The change involves two parts:

Creating a lowercased version of the ALLOWED_SENDERS list once at the beginning of the function for efficiency.
Converting the incoming sender's email to lowercase before checking for its inclusion in the new list.
Here is the diff for the change:

Code.js
-1
+4
    }
  }
  
  // Create a lowercased version of the allowed senders list for case-insensitive comparison.
  const allowedSendersLower = ALLOWED_SENDERS.map(email => email.toLowerCase());

  // Search for threads with the processing label but not the processed label
  const query = `label:${GMAIL_PROCESSING_LABEL} -label:${GMAIL_PROCESSED_LABEL}`;
  const threads = GmailApp.search(query);
        }

        // Check if the sender is in the allowed list
        if (ALLOWED_SENDERS.includes(senderEmail)) {
        if (allowedSendersLower.includes(senderEmail.toLowerCase())) {
          console.log(`Processing message: "${message.getSubject()}" (ID: ${message.getId()}) from allowed sender.`);

          // Get the raw RFC 822 formatted email content

This change makes your sender validation more robust and ensures that emails are correctly processed regardless of capitalization.