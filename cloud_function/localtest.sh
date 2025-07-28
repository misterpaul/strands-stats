GCLOUD_PROJECT=strands-stats \
EMAILS_BUCKET=snvn-email-testing \
SUCCESS_BUCKET=snvn-email-success-testing \
FAILURE_BUCKET=snvn-email-failures-testing \
FIRESTORE_COLLECTION=strands \
FIRESTORE_DATABASE_ID=games-testing \
npx @google-cloud/functions-framework --target=processIncomingEmailJs --signature-type=cloudevent