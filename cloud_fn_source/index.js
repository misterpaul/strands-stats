const functions = require('@google-cloud/functions-framework');
const { Storage } = require('@google-cloud/storage');
const { Firestore } = require('@google-cloud/firestore');
const { simpleParser } = require('mailparser');

// --- Configuration ---
// Read from environment variables for security and flexibility.
const {
  EMAILS_BUCKET,
  SUCCESS_BUCKET,
  FAILURE_BUCKET,
  FIRESTORE_COLLECTION,
  GCLOUD_PROJECT,
  FIRESTORE_DATABASE_ID
} = process.env;


/**
 * Parses the raw content of an email to extract structured game data.
 * @param {string} emailBody - The plain text body of the email.
 * @param {object} parsedEmail - The full parsed email object from mailparser.
 * @returns {object} The structured game data.
 * @throws {Error} If required data fields cannot be parsed.
 */
function parseEmailForGameData(emailBody, parsedEmail) {
    const gameData = {
        sender: parsedEmail.from?.value[0]?.address || null,
        game: parsedEmail.subject || null,
        gameNumber: null,
        gameTitle: null,
        results: null,
        processedAt: new Date().toISOString()
    };

    const gameNumberRegex = /Strands\s+#(\d+)/;
    const gameNumberMatch = emailBody.match(gameNumberRegex);
    if (gameNumberMatch && gameNumberMatch[1]) {
        gameData.gameNumber = parseInt(gameNumberMatch[1], 10);
    }

    const gameTitleRegex = /“([^”]+)”/;
    const gameTitleMatch = emailBody.match(gameTitleRegex);
    if (gameTitleMatch && gameTitleMatch[1]) {
        gameData.gameTitle = gameTitleMatch[1];
    }

    const lines = emailBody.split('\n');
    const resultsLines = [];
    const emojiLineRegex = /^[\p{Emoji}\s]+$/u;
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine !== '' && emojiLineRegex.test(trimmedLine)) {
            resultsLines.push(trimmedLine);
        }
    }
    if (resultsLines.length > 0) {
        gameData.results = resultsLines.join('');
    }
    
    // --- Validate extracted game data ---
    if (!gameData.sender) throw new Error("Missing data: Could not determine sender's email address.");
    if (gameData.gameNumber === null) throw new Error("Missing data: Could not parse Game Number from email body.");
    if (gameData.gameTitle === null) throw new Error("Missing data: Could not parse Game Title from email body.");
    if (gameData.results === null) throw new Error("Missing data: Could not parse game results from email body.");
    
    return gameData;
}

/**
 * Moves a file to a specified destination bucket.
 * @param {object} file - The GCS file object to move.
 * @param {string} destinationBucketName - The name of the bucket to move the file to.
 */
async function archiveFile(file, destinationBucketName) {
    try {
        console.log(`Archiving ${file.name} to gs://${destinationBucketName}/${file.name}`);
        await file.move(`gs://${destinationBucketName}/${file.name}`);
        console.log(`Successfully archived ${file.name}.`);
    } catch (moveErr) {
        console.error(`CRITICAL: Failed to archive ${file.name} to ${destinationBucketName}.`, moveErr);
    }
}

/**
 * Main Cloud Function entry point. Triggered by a new file in the EMAILS_BUCKET.
 * It processes the single file that triggered the event.
 */
functions.cloudEvent('dataloader', async (cloudEvent) => {
  // --- LAZY INITIALIZATION of clients inside the handler ---
  // This is a best practice for Cloud Functions to improve cold start times
  // and prevent issues with client initialization in the global scope.
  const storage = new Storage();
  const firestore = new Firestore({
      projectId: GCLOUD_PROJECT,
      databaseId: FIRESTORE_DATABASE_ID, 
  });

  // --- Configuration Check ---
  if (!EMAILS_BUCKET || !SUCCESS_BUCKET || !FAILURE_BUCKET || !FIRESTORE_COLLECTION || !GCLOUD_PROJECT || !FIRESTORE_DATABASE_ID) {
    console.error("Configuration error: One or more environment variables are not set.");
    // For a fatal config error, just returning is often better than retrying.
    return; 
  }

  // --- Main Logic ---
  const fileData = cloudEvent.data;
  console.log(`Processing file: ${fileData.name} from bucket: ${fileData.bucket}`);
  
  if (fileData.bucket !== EMAILS_BUCKET) {
    console.log(`Ignoring event from bucket ${fileData.bucket}. This function only processes files in ${EMAILS_BUCKET}.`);
    return;
  }

  const sourceFile = storage.bucket(fileData.bucket).file(fileData.name);

  try {
    const fileStream = sourceFile.createReadStream();
    const parsedEmail = await simpleParser(fileStream);

    if (!parsedEmail.text) {
        throw new Error("Missing data: Email body is empty.");
    }

    const gameData = parseEmailForGameData(parsedEmail.text, parsedEmail);

    console.log(`Extracted Game Data for ${sourceFile.name}:`, JSON.stringify(gameData, null, 2));
    
    await firestore.collection(FIRESTORE_COLLECTION).add(gameData);
    console.log(`Successfully wrote data for ${sourceFile.name} to Firestore.`);

    await archiveFile(sourceFile, SUCCESS_BUCKET);

  } catch (err) {
    console.error(`An error occurred while processing ${sourceFile.name}:`, err);
    await archiveFile(sourceFile, FAILURE_BUCKET);
  }
});
