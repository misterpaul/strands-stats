# Request

Are IAM permissions granted in Firestore only at the project level or can they be granted for specific databases?

# Response

That's an excellent question about how permissions work in Google Cloud.

To answer your question directly: **IAM permissions for Firestore are granted at the project level, not for specific databases within a project.**

Here's a breakdown of what that means:

* IAM (Identity and Access Management): This system controls who (which user or service account) can access which Google Cloud service and what they can do (e.g., read, write, delete). When you give your Cloud Function's service account a role like Cloud Datastore User (which grants read/write access to Firestore), you are giving it permission to access any and all Firestore databases within that entire GCP project.
* Firestore Security Rules: For more fine-grained control inside a database, you use Firestore's own security system, called Security Rules. This is where you write rules to control things like:
  * Which users can read or write to a specific collection (like your your-firestore-collection).
  * If a user can only edit their own documents.
  * What format the data must be in to be written.

So, to summarize:
* IAM gets your function "in the door" to the Firestore service for the whole project.
* Security Rules control what your function can do once it's "inside" a specific database.
