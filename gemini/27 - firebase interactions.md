# Request

please help me determine why this command is failing to delete all documents in the /strands collection in the games-dev database in my project.

plaintext: 5 lines selected
firebase firestore:delete --recursive --database games-dev  /strands
✔ You are about to delete all documents in the collection at strands and all of their subcollections  for
projects/undefined/databases/games-dev/documents. Are you sure? Yes

Error: Deletion failed. Errors: Failed to fetch documents to delete &gt;= 3 times..

# Response

Of course, I can help you with that. It's a frustrating error because it seems like it should work, but the key clue is hidden in the confirmation message.

The problem is that the Firebase CLI doesn't know which Google Cloud project to operate on. You can see this in the confirmation line here:

projects/undefined/databases/games-dev/documents

The undefined project ID is causing the command to fail when it tries to connect to the Firestore API. The error Failed to fetch documents to delete happens because it's impossible to fetch documents from a project that doesn't exist.

The Solution
You need to explicitly tell the Firebase CLI which project to use. You can do this by adding the --project flag to your command.

Assuming your project ID is strands-stats (based on your logs), the corrected command would be:

bash
firebase firestore:delete /strands --recursive --database games-dev --project strands-stats
When you run this, the confirmation prompt should now show the correct project ID, and the deletion will succeed.

A More Permanent Alternative
If you plan on running multiple commands against this project, it's often easier to set the active project for your current directory first. This way, you don't have to add the --project flag to every command.

You can do this by running:

bash
firebase use strands-stats
After setting the active project, your original command will work as expected:

bash
firebase firestore:delete /strands --recursive --database games-dev
This should get your documents deleted successfully.