This is an application which captures results from the NYT Strands game and stores them for users to see their history and compare with others.

Expected application flow:

User registers. We will use Google Identity Service so that users can register using one of the various ways supported. When a user registers, the indicate if their game scores are private or public. We store registration information in a Firestore data collection name Accounts. Data will include creation date, user's email (hashed), a "handle" - the name others will see for them if they make game data public, and the visibility they choose for game data.
After registering, when a user completes a Strands game, they select Share and select the email option. They enter the APPLICATION-EMAIL-ADDRESS (eg app-email@sample.com) and their email client sends the game data to the APPLICATION-EMAIL-ADDRESS.
A rule in the APPLICATION-EMAIL-ADDRESS labels incoming emails that match certain criteria as TO-PROCESS
A google app script monitors the APPLICATION-EMAIL-ADDRESS inbox and for every email labeled TO-PROCESS, it: a. validates the email matches certain formatting expectations to be legitimate and parseable b. Copies the email to a text file in a Cloud Storage Bucket c. Labels the email COMPLETE and removes the TO-PROCESS label
New files in the storage bucket trigger a Cloud Function which: a. Further validates the email. If it fails the validation it is moved to a FAILED storage bucket. One of the validation steps is to confirm that a hash of the user's email matches a hashed email in the Accounts collection. If it passes, the process continues b. Parses the email and stores the results in a Firebase database. Data will include the date, user's email (hashed), game number, game title, and game results.
After registering, the application shows statistics about the user's game results along with statistics on game results from others who have elected to make their game results public.
Tech Stack, Related Accounts, and IAM

Google email account (app-email)
Google App Script in email account (app-email)
Google Cloud Storage Bucket (app-email: write, function-svc-acct: read, delete)
Google Cloud Function (function-svc-acct)
Google Firestore database (function-svc-acct: write, app-engine-svc-acct: read, delete)
Google Identity Service
Google App Engine (app-engine-svc-acct)
Javascript using Vue for a single page application
