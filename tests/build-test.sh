tofu apply && \
firebase firestore:delete --recursive --database games-dev --project strands-stats /strands && \
(gsutil rm gs://snvn-emails-dev/*; gsutil rm gs://snvn-emails-failures-dev/*; gsutil rm gs://snvn-emails-success-dev/*; gsutil cp ../samples/email/test-email.eml gs://snvn-emails-dev)