// index.js

const functions = require('@google-cloud/functions-framework');
const { Storage } = require('@google-cloud/storage');
const { Firestore } = require('@google-cloud/firestore');
const { simpleParser } = require('mailparser');
const { GoogleAuth } = require('google-auth-library');

// Configuration is read from environment variables for security and flexibility.
const EMAILS_BUCKET = process.env.EMAILS_BUCKET;
const SUCCESS_BUCKET = process.env.SUCCESS_BUCKET;
const FAILURE_BUCKET = process.env.FAILURE_BUCKET;
const FIRESTORE_COLLECTION = process.env.FIRESTORE_COLLECTION;
const GCLOUD_PROJECT = process.env.GCLOUD_PROJECT;
const FIRESTORE_DATABASE_ID = process.env.FIRESTORE_DATABASE_ID; // Added for non-default databases

// Initialize Google Cloud clients
const storage = new Storage();
// Explicitly setting projectId and databaseId to connect to the correct resources.
const firestore = new Firestore({
    projectId: GCLOUD_PROJECT,
    databaseId: FIRESTORE_DATABASE_ID, 
});
const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/cloud-platform'
});


/**
 * A Gen 2 Cloud Function triggered by a CloudEvent from a GCS bucket.
 *
 * @param {object} cloudEvent The CloudEvent data.
 */
functions.cloudEvent('processIncomingEmailJs', async (cloudEvent) => {
  // --- ADDED: Log environment and authentication for debugging ---
  const credentials = await auth.getCredentials();
  console.log('--- Environment & Auth Debug ---');
  console.log(`GCLOUD_PROJECT: ${GCLOUD_PROJECT}`);
  console.log(`FIRESTORE_DATABASE_ID: ${FIRESTORE_DATABASE_ID}`);
  console.log(`Authenticated Account: ${credentials.client_email || 'User credentials (ADC)'}`);
  console.log(`EMAILS_BUCKET: ${EMAILS_BUCKET}`);
  console.log(`FIRESTORE_COLLECTION: ${FIRESTORE_COLLECTION}`);
  console.log('---------------------------------');
  
  // --- Fail fast if configuration is missing ---
  if (!EMAILS_BUCKET) throw new Error("Configuration error: EMAILS_BUCKET environment variable is not set.");
  if (!SUCCESS_BUCKET) throw new Error("Configuration error: SUCCESS_BUCKET environment variable is not set.");
  if (!FAILURE_BUCKET) throw new Error("Configuration error: FAILURE_BUCKET environment variable is not set.");
  if (!FIRESTORE_COLLECTION) throw new Error("Configuration error: FIRESTORE_COLLECTION environment variable is not set.");
  if (!GCLOUD_PROJECT) throw new Error("Configuration error: GCLOUD_PROJECT environment variable is not set.");
  if (!FIRESTORE_DATABASE_ID) throw new Error("Configuration error: FIRESTORE_DATABASE_ID environment variable is not set.");
  
  const file = cloudEvent.data;
  console.log(`New email file received: ${file.name} in bucket: ${file.bucket}.`);

  // Ensure the event is for the correct source bucket
  if (file.bucket !== EMAILS_BUCKET) {
    console.log(`Ignoring event from bucket ${file.bucket}. This function only processes files in ${EMAILS_BUCKET}.`);
    return;
  }

  const sourceBucket = storage.bucket(file.bucket);
  const gcsFile = sourceBucket.file(file.name);

  try {
    const [exists] = await gcsFile.exists();
    if (!exists) {
        console.error(`Error: File ${file.name} not found in bucket ${file.bucket}.`);
        return;
    }

    const fileStream = gcsFile.createReadStream();
    console.log("Parsing email content...");
    const parsedEmail = await simpleParser(fileStream);

    // --- START: VALIDATION AND DATA EXTRACTION ---
    if (!parsedEmail.from?.value?.length) throw new Error("Missing data: Email 'From' field is empty.");
    if (!parsedEmail.to?.value?.length) throw new Error("Missing data: Email 'To' field is empty.");

    let gameData; // Declare gameData outside the 'if' block scope

    if (parsedEmail.text) {
        const emailBody = parsedEmail.text;
        // Initialize the object to be populated
        gameData = {
            sender: parsedEmail.from?.value[0]?.address || null,
            game: parsedEmail.subject || null,
            gameNumber: null,
            gameTitle: null,
            results: null,
            processedAt: new Date().toISOString() // Add a timestamp
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
        
    } else {
        throw new Error("Missing data: Email body is empty.");
    }
    // --- END: CUSTOM DATA EXTRACTION LOGIC ---

    // --- SUCCESS HANDLER: All parsing and validation passed ---
    
    // 1. Write data to Firestore
    console.log("--- Extracted Game Data ---");
    console.log(JSON.stringify(gameData, null, 2));
    console.log(`Writing data to Firestore collection: ${FIRESTORE_COLLECTION}`);
    await firestore.collection(FIRESTORE_COLLECTION).add(gameData);
    console.log("Successfully wrote to Firestore.");

    // 2. Move successful email to the success bucket
    // console.log(`Moving processed file to gs://${SUCCESS_BUCKET}/${file.name}`);
    // await gcsFile.move(`gs://${SUCCESS_BUCKET}/${file.name}`);
    // console.log(`Successfully processed and moved email ${file.name}.`);

  } catch (err) {
    console.error(`An error occurred while processing ${file.name}:`, err);
    
    // --- FAILURE HANDLER: Move failed email to the failure bucket ---
    try {
        // console.log(`Moving failed file to gs://${FAILURE_BUCKET}/${file.name}`);
        // await gcsFile.move(`gs://${FAILURE_BUCKET}/${file.name}`);
        // console.log(`Successfully moved failed email ${file.name} to error bucket.`);
    } catch (moveErr) {
        console.error(`CRITICAL ERROR: Failed to move file ${file.name} to the failure bucket.`, moveErr);
    }
  }
});
