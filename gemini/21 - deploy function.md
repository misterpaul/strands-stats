# Request

ok lets deploy it as a cloud function that is run when a file is added to the storage bucket. That should be the only trigger mechanism. Unlike my local testing, I do not want the function exposed as an HTTP function. Also, the function should run using its own service account, not the default service account.

# Response

Of course. Deploying with a dedicated service account and a non-HTTP trigger is the most secure and robust way to run this function in production.

I have created a new, comprehensive guide that walks you through the entire process, from creating the service account to deploying the function with the correct permissions and trigger.

## Overview
This guide details how to deploy your Cloud Function so that it runs with a dedicated, least-privilege service account and is triggered only by file creation in your GCS bucket, with no public HTTP endpoint.

## Step 1: Create a Dedicated Service Account
First, create a new service account that your function will use as its identity. This ensures it only has the permissions you explicitly grant it.

Replace your-service-account-name with a name for your service account (e.g., email-processor-sa).

```
gcloud iam service-accounts create your-service-account-name \
  --description="Service account for the email processing Cloud Function" \
  --display-name="Email Processor Service Account"
```

After running this, you will get an email address for your new service account. It will look like:
`your-service-account-name@your-gcp-project-id.iam.gserviceaccount.com`. You will need this email for the next steps.

## Step 2: Grant Permissions to the Service Account
Your new service account needs permission to read/write to your GCS buckets and write to Firestore.

### 2.1 Grant Storage Permissions
The service account needs to read from the source bucket and move files to the success/failure buckets. The Storage Object Admin role is the most straightforward for this. Run this command three times, once for each bucket.

Replace the placeholders with your service account email and bucket names.

**Permission for the incoming emails bucket**
```
gcloud storage buckets add-iam-policy-binding gs://your-emails-bucket \
  --member="serviceAccount:your-service-account-name@your-gcp-project-id.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
```

**Permission for the success bucket**
```
gcloud storage buckets add-iam-policy-binding gs://your-success-bucket \
  --member="serviceAccount:your-service-account-name@your-gcp-project-id.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
```

**Permission for the failure bucket**
```
gcloud storage buckets add-iam-policy-binding gs://your-failure-bucket \
  --member="serviceAccount:your-service-account-name@your-gcp-project-id.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
```


### 2.2 Grant Firestore Permissions
The service account needs permission to write to your Firestore database. The Cloud Datastore User role grants this.

Replace the placeholders with your project ID and service account email.

```
gcloud projects add-iam-policy-binding your-gcp-project-id \
  --member="serviceAccount:your-service-account-name@your-gcp-project-id.iam.gserviceaccount.com" \
  --role="roles/datastore.user"
```

## Step 3: Deploy the Cloud Function
Now, deploy the function using the new service account and ensuring no HTTP trigger is created. The --trigger-event-filters flag correctly sets up the GCS trigger without exposing an HTTP endpoint.

Replace all placeholder values in the command below.

```
gcloud functions deploy processIncomingEmailJs \
  --gen2 \
  --runtime=nodejs24 \
  --region=your-gcp-region \
  --source=. \
  --entry-point=processIncomingEmailJs \
  --trigger-event-filters="type=google.cloud.storage.object.v1.finalized" \
  --trigger-event-filters="bucket=your-emails-bucket" \
  --service-account="your-service-account-name@your-gcp-project-id.iam.gserviceaccount.com" \
  --set-env-vars="EMAILS_BUCKET=your-emails-bucket,SUCCESS_BUCKET=your-success-bucket,FAILURE_BUCKET=your-failure-bucket,FIRESTORE_COLLECTION=your-firestore-collection,GCLOUD_PROJECT=your-gcp-project-id,FIRESTORE_DATABASE_ID=your-firestore-database-id"
```

Key Change:

--service-account: This crucial flag tells the Cloud Function to run using the identity and permissions of the service account you just created, rather than the default one.

After following these steps, your function will be securely deployed and ready to process emails.
