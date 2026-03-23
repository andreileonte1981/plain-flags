#!/bin/bash
# Cleanup script to remove all Plain Flags GCP resources

set -e

# Check for config file
if [ ! -f "config/instance-config" ]; then
    echo "Error: config/instance-config file not found"
    echo "Please ensure you're in the correct directory with config/instance-config"
    exit 1
fi

# Read configuration
source ./config/instance-config

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "your-project-id-here" ]; then
    echo "Error: PROJECT_ID not set in instance-config"
    exit 1
fi

SERVICE_NAME="plainflags-management"
INSTANCE_NAME="plainflags-db"
SA_EMAIL="plainflags-runner@$PROJECT_ID.iam.gserviceaccount.com"

echo "Deleting ALL Plain Flags resources from project: $PROJECT_ID"
read -p "Continue? (y/N): " confirmation

if [[ ! "$confirmation" =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 0
fi

gcloud config set project $PROJECT_ID

# Delete credit-consuming resources using dedicated script
    ./cleanup-billing-resources.sh

# Delete secrets
if gcloud secrets describe plainflags-db-password >/dev/null 2>&1; then
    gcloud secrets delete plainflags-db-password --quiet
    echo "✓ Secret deleted"
else
    echo "- Secret not found"
fi

# Delete service account
if gcloud iam service-accounts describe $SA_EMAIL >/dev/null 2>&1; then
    gcloud iam service-accounts delete $SA_EMAIL --quiet
    echo "✓ Service account deleted"
else
    echo "- Service account not found"
fi

# Clean up local files
if [ -f ".db-connection-name" ]; then
    rm .db-connection-name
    echo "✓ Removed .db-connection-name"
fi

echo "Cleanup complete"