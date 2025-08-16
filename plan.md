# Project Plan

## Phase 1: Backend Data Pipeline

*   **[x] Initial Manual Setup (One-time)**
    *   [x] Create Google Cloud Project.
    *   [x] Create user accounts (Admin, Developer, `games@sennovation.com`).
    *   [x] Install local tooling (OpenTofu, gcloud CLI, Volta, clasp).

*   **[x] Infrastructure as Code (Managed by OpenTofu)**
    *   [x] Define project services (APIs to enable like Cloud Functions, Eventarc, Firestore).
    *   [x] Create GCS buckets (`emails`, `success`, `failures`) with lifecycle policies.
    *   [x] Create Firestore database (`games-dev`/`games-prod`).
    *   [x] Create dedicated service account for the Cloud Function.
    *   [x] Grant IAM permissions:
        *   [x] Function SA -> Access to GCS buckets (`storage.objectAdmin`).
        *   [x] Function SA -> Access to Firestore (`datastore.user`).
        *   [x] Function SA -> Receive Eventarc events (`eventarc.events.receiveEvent`).
        *   [x] Function SA -> Invoke its own Cloud Run service (`run.invoker`).
        *   [x] GCS Service Agent -> Publish to Pub/Sub for triggers (`pubsub.publisher`).

*   **[x] Cloud Function (`dataloader`)**
    *   [x] Develop Node.js function to parse emails and write to Firestore.
    *   [x] Deploy function via OpenTofu (`google_cloudfunctions2_function`).
    *   [ ] Revisit what SA cloud function uses

*   **[x] Email Ingestion (Managed by Apps Script & `clasp`)**
    *   [x] Develop Apps Script to forward emails from Gmail to GCS.
    *   [x] Configure Gmail (filters and labels) manually.
    *   [x] Deploy Apps Script using `clasp`.
    *   [x] Set up time-based trigger for the script manually in the UI or via `clasp`.
    *   [ ] Enhance Apps Script with sender validation logic (e.g., check against Firestore `accounts` collection).
    *   [ ] Enhance Apps Script to restrict any account to N emails per day

## Phase 2: Web Application Frontend

*   **[ ] Infrastructure as Code (Managed by OpenTofu)**
    *   [ ] Configure Firebase Hosting (or App Engine) for the frontend.
    *   [ ] Configure Google Identity (Manual Step):
        *   [x] Manually configure OAuth Consent Screen in the GCP Console.
        *   [x] Manually create OAuth 2.0 Client ID for the web app and add to Secret Manager
        *   [x] Add test users to Google Auth Platform / Audience? (tofu? manual?) **NOTE: could not add AB's email.**
        *   [x] Configure scopes in Google Auth Platform / Data Access? (tofu? manual?) - According to Gemini, not needed b/c basic scopes are added by default when we use Google Identity

*   **[ ] GUI Development (Vue.js)**
    *   [ ] Create basic Vue app structure using Vite.
    *   [ ] Implement "Sign in with Google" using the OAuth Client ID.
    *   [ ] Build welcome screen for unauthenticated users.
    *   [ ] Build dashboard for authenticated users to view their data from Firestore.

*   **[ ] Firestore Security**
    *   [ ] Develop Firestore Security Rules to control data access (e.g., users can only read their own data).
    *   [ ] Deploy security rules using the Firebase CLI (`firebase deploy --only firestore:rules`).


## Phase 3: Threat Modeling & Security Testing

*   **[ ] Threat Modeling**
    *   [ ] AI based threat modeling
    *   [ ] Manual threat modeling


*   **[ ] Security Testing**
    *   [ ] SAST testing
    *   [ ] DAST testing
    *   [ ] Fuzzing
    *   [ ] Pen Testing

## Phase 4: Productionalize
*   **[ ] Projects**
    *   [ ] Determine whether to put production in same project or different project
    *   [ ] Refactor and/or rebuild Dev environment if needed based on decision above

*   **[ ] OAuth**
    *   [ ] Create App Logo and add to Google Auth Platform / Branding > App Logo
    *   [ ] Add App domain & authorized domain information to Branding page
    *   [ ] Submit app for verification
    *   [ ] Publish Oauth App from Google Auth Platform / Audience

*  **[ ] Professional details
    *   [ ] Create a Privacy Policy and Terms of Service 


## Phase 5: Marketing
