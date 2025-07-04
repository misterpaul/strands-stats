// index.js

const functions = require('@google-cloud/functions-framework');
const { Storage } = require('@google-cloud/storage');
const { simpleParser } = require('mailparser');

// --- Function Configuration ---
// IMPORTANT: Before deploying, create a Cloud Storage bucket
// and replace the placeholder below with your bucket's name.
const BUCKET_NAME = "your-email-landing-zone-bucket"; 

// Initialize the Cloud Storage client
const storage = new Storage();

/**
 * A Gen 2 Cloud Function triggered by a CloudEvent from a GCS bucket.
 *
 * @param {object} cloudEvent The CloudEvent data.
 */
functions.cloudEvent('processIncomingEmailJs', async (cloudEvent) => {
  // The CloudEvent data contains metadata about the trigger
  const file = cloudEvent.data;

  console.log(`New email file received: ${file.name} in bucket: ${file.bucket}.`);

  // Ensure the event is for the correct bucket if the trigger is less specific.
  if (file.bucket !== BUCKET_NAME) {
    console.log(`Ignoring event from bucket ${file.bucket}. This function only processes files in ${BUCKET_NAME}.`);
    return;
  }

  try {
    // Create a reference to the GCS file
    const bucket = storage.bucket(file.bucket);
    const gcsFile = bucket.file(file.name);
    
    // Check if the file exists
    const [exists] = await gcsFile.exists();
    if (!exists) {
        console.error(`Error: File ${file.name} not found in bucket ${file.bucket}.`);
        return;
    }

    // Download the email file content as a stream for efficient parsing
    const fileStream = gcsFile.createReadStream();
    
    console.log("Parsing email content...");
    
    // Use the mailparser library to parse the raw email stream
    const parsedEmail = await simpleParser(fileStream);

    // --- Parsed Email ---
    console.log("--- Parsed Email ---");
    console.log(`  From: ${parsedEmail.from?.text || 'No Sender'}`);
    console.log(`  To: ${parsedEmail.to?.text || 'No Recipient'}`);
    console.log(`  Subject: ${parsedEmail.subject || 'No Subject'}`);

    // --- START: CUSTOM DATA EXTRACTION LOGIC ---
    if (parsedEmail.text) {
        const emailBody = parsedEmail.text;
        const gameData = {
            sender: parsedEmail.from?.value[0]?.address || null,
            game: parsedEmail.subject || null,
            gameNumber: null,
            gameTitle: null,
            results: null
        };

        // Regex to find "Strands #<number>"
        const gameNumberRegex = /Strands\s+#(\d+)/;
        const gameNumberMatch = emailBody.match(gameNumberRegex);
        if (gameNumberMatch && gameNumberMatch[1]) {
            gameData.gameNumber = parseInt(gameNumberMatch[1], 10);
        }

        // Regex to find the title inside quotation marks “...”
        const gameTitleRegex = /“([^”]+)”/;
        const gameTitleMatch = emailBody.match(gameTitleRegex);
        if (gameTitleMatch && gameTitleMatch[1]) {
            gameData.gameTitle = gameTitleMatch[1];
        }

        // --- REVISED RESULTS EXTRACTION ---
        // New rule: Results lines consist only of emojis and whitespace.
        const lines = emailBody.split('\n');
        const resultsLines = [];
        
        // This regex matches lines that contain one or more emoji or whitespace characters, and nothing else.
        // The 'u' flag is essential for Unicode property escapes like \p{Emoji}.
        const emojiLineRegex = /^[\p{Emoji}\s]+$/u;

        for (const line of lines) {
            const trimmedLine = line.trim();
            // Test if the line consists only of emojis and whitespace.
            if (trimmedLine !== '' && emojiLineRegex.test(trimmedLine)) {
                resultsLines.push(trimmedLine);
            }
        }
        
        if (resultsLines.length > 0) {
            gameData.results = resultsLines.join('\n');
        }
        // --- END REVISED RESULTS EXTRACTION ---

        console.log("--- Extracted Game Data ---");
        console.log(JSON.stringify(gameData, null, 2));

    } else {
        console.log("--- No Plain Text Body Found to Extract Data From ---");
    }
    // --- END: CUSTOM DATA EXTRACTION LOGIC ---

    console.log(`Successfully processed email ${file.name}.`);
    
    // Optionally, you can delete the email file from the bucket after processing
    // await gcsFile.delete();
    // console.log(`Deleted ${file.name} from bucket.`);

  } catch (err) {
    console.error(`An error occurred while processing ${file.name}:`, err);
    // Depending on your needs, you might want to move the file to an "error" folder
    // to prevent re-triggering failures.
  }
});
