# Request

What are the minimum permissions necessary for the games@sennovation.com account to be able to link the Apps Script to the project?

# Response

That's a critical question for setting up the account with the principle of least privilege.

To perform Step 4 (Link Script to Google Cloud Platform), the games@sennovation.com account needs the Editor (roles/editor) permission on the Google Cloud project.

Here's why:

Viewer (roles/viewer) is not enough: A user with only Viewer permissions can see the project and its resources (and thus find the Project Number), but they cannot make any changes. Linking an Apps Script is considered a configuration change to the GCP project, so viewer access is insufficient.

Editor (roles/editor) is the minimum required: This role grants the necessary resourcemanager.projects.update permission, which allows the user to modify project settings, including associating services like Apps Script with it.

Best Practice Recommendation:

Since Project Editor is a highly privileged role, you ideally don't want the games@sennovation.com account to have it permanently. The most secure approach is:

A user who is already a Project Owner or Project Editor performs the one-time action of linking the script to the GCP project (Step 4 in the guide).

After that, the games@sennovation.com account only needs the more limited permissions for its day-to-day work (like Storage Object Creator on the specific bucket), which you grant separately.

This way, the linking is done by an administrator, and the functional account retains only the minimal permissions it needs to run the script.
