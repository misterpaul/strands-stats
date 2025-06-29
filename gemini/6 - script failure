# Request

The script is failing with error:

GoogleJsonResponseException: API call to gmail.users.labels.get failed with error: Requested entity was not found.
at processNewEmails(Code:24:46)

Line 24 is:
const processingLabel = Gmail.Users.Labels.get('me', GMAIL_PROCESSING_LABEL);

# Response

That's a very specific and helpful error message. Thank you for providing it.

The error Requested entity was not found means exactly what it says: the script is trying to find a Gmail label by its name ('process-for-cloud-function'), but it can't find that label in the Gmail account it's running in.

This almost always comes down to a small mismatch. Here’s how to fix it:

Check the Label in Gmail:

Go into the games@sennovation.com Gmail account.

Click the Settings gear -> See all settings -> Labels tab.

Scroll down to your "Labels" list and find the one you created.

Check the Constant in the Script:

Go back to your Apps Script code.

Look at this line: const GMAIL_PROCESSING_LABEL = 'process-for-cloud-function';

Compare them Carefully: The name of the label in your Gmail settings must be exactly identical to the string in the script.

Check for typos.

Check for extra spaces at the beginning or end.

Check for case sensitivity (though labels are usually not case-sensitive, it's best practice to match it).

The most common cause is a simple typo in one place or the other. Once you ensure the label name in Gmail matches the constant in the script perfectly, the error will be resolved.

You should also double-check the GMAIL_PROCESSED_LABEL at the same time, as you will get the same error for that label on the next line if it's also mismatched.
