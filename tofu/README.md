### **OpenTofu Deployment Guide for Email Processing Function**

This guide explains how to use the provided OpenTofu scripts to deploy the entire infrastructure for the email processing Cloud Function.

#### **Prerequisites**

1. **Install OpenTofu:** Follow the official instructions at [opentofu.org/docs/intro/install](https://opentofu.org/docs/intro/install/).  
2. **Install Google Cloud SDK:** Follow the official instructions at [cloud.google.com/sdk/install](https://cloud.google.com/sdk/install).  
3. **Authenticate:** Log in with a user account that has Owner or Editor permissions on your GCP project.  
   gcloud auth login  
   gcloud auth application-default login

#### **Project Structure**

Ensure your files are organized as follows:

/terraform-deployment  
  |- main.tf  
  |- variables.tf  
  |- outputs.tf  
  |- README.md  
  cloud_fn_source  
    |- index.js  
    |- package.json

#### **Deployment Steps**

1. Create a terraform.tfvars file:  
   In the /terraform-deployment directory, create a new file named terraform.tfvars. This is where you will define the values for the variables.  
   **Copy and paste the following content into terraform.tfvars and replace the placeholder values with your own:**  
   project\_id            \= "your-gcp-project-id"  
   region                \= "us-central1"  
   emails\_bucket\_name    \= "your-unique-emails-bucket-name"  
   success\_bucket\_name   \= "your-unique-success-bucket-name"  
   failure\_bucket\_name   \= "your-unique-failure-bucket-name"  
   firestore\_collection  \= "your-firestore-collection-name"  
   firestore\_database\_id \= "your-firestore-database-id"

2. Initialize OpenTofu:  
   Open your terminal, navigate to the /terraform-deployment directory, and run the init command. This will download the necessary provider plugins.  
   tofu init

3. Plan the Deployment:  
   Run the plan command to see what resources OpenTofu will create. This is a dry run and won't change anything.  
   tofu plan

   Review the output to ensure everything looks correct.  
4. Apply the Configuration:  
   Run the apply command to create all the resources in Google Cloud.  
   tofu apply

   OpenTofu will show you the plan again and ask for confirmation. Type yes and press Enter.

The deployment will take several minutes. Once complete, your entire infrastructure—including the function, buckets, service account, and all necessary permissions—will be live.

#### **Destroying the Infrastructure**

When you are finished and want to remove all the resources created by OpenTofu, run the destroy command:

tofu destroy

Type yes to confirm. This will delete the function, buckets, and IAM bindings, helping to avoid unnecessary costs.