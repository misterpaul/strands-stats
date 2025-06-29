# Request

The email will be games@sennovation.com. What permissions should I give to the bucket GCS_BUCKET_NAME? Do you recommend any other storage bucket configuration settings?

# Response

Excellent question. Getting the bucket permissions and configuration right is crucial for both security and cost-effectiveness. Here's a breakdown based on your setup.

Bucket Permissions for GCS_BUCKET_NAME
Two different "identities" will need to interact with your bucket: the Apps Script and the Cloud Function.

For the Apps Script (run by games@sennovation.com):

Principal (Who): The Google Workspace user account that you authorize to run the Apps Script, which in this case should be games@sennovation.com.

Required Role (What): Storage Object Creator (roles/storage.objectCreator).

Why: This role grants the single permission needed: storage.objects.create. It allows the script to upload new email files to the bucket but does not grant it permission to read, overwrite, or delete existing files, which is a good security practice (Principle of Least Privilege).

For the Cloud Function:

Principal (Who): When you deploy a Gen 2 Cloud Function with a storage trigger, Google Cloud automatically creates a dedicated service account for it.

Required Role (What): Storage Object Viewer (roles/storage.objectViewer).

Why: This allows the function to read the content of the email file that triggered it.

Good News: You almost never have to do this manually. The deployment process automatically grants this role to the function's service account for the trigger bucket.

Action to Take: In the Google Cloud Console, navigate to your GCS bucket, go to the "Permissions" tab, and click "Grant Access". Add games@sennovation.com as a new principal and assign it the Storage Object Creator role.

Other Recommended Bucket Configurations
Here are a few other settings I strongly recommend for this specific use case:

Location: Set your bucket's location to the same region where you will run your Cloud Function (e.g., us-central1). This minimizes network latency and avoids data transfer costs between regions.

Access Control: Use Uniform bucket-level access. This is the default for new buckets and is a much simpler and more robust security model than the older "Fine-grained" (ACL-based) model.

Lifecycle Rules (Very Important): Your bucket will accumulate thousands of email files over time, which will cost you money. A lifecycle rule can manage this automatically.

Good for most cases (Delete after processing): Create a rule to delete objects after a set number of days (e.g., 30 or 60 days). This keeps the bucket clean if you don't need the original email files after your function has processed them.

Good for compliance (Archive then delete): If you need to keep emails for auditing, create a multi-stage rule:

Transition objects from Standard to a cheaper class like Coldline storage after 30 days.

Delete the objects after 365 days.

Object Versioning: Keep this disabled unless you have a specific compliance requirement to do so. For this workflow, it adds unnecessary cost and complexity. If an email fails to process, it's better to have your Cloud Function move it to an "error" folder within the bucket rather than relying on versions.
