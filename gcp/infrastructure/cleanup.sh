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

echo "WARNING: This will delete ALL Plain Flags resources from project: $PROJECT_ID"
echo ""
echo "Resources to be deleted:"
echo "- Cloud Run service: $SERVICE_NAME"
echo "- Cloud SQL instance: $INSTANCE_NAME (including all data!)"
echo "- Secret: plainflags-db-password"
echo "- Service account: $SA_EMAIL"
echo "- Configuration files: .db-connection-name"
echo ""
echo "This action cannot be undone!"
echo ""

# Confirmation prompt
read -p "Are you sure you want to delete all resources? (type YES to confirm): " confirmation

if [ "$confirmation" != "YES" ]; then
    echo "Operation cancelled"
    exit 0
fi

echo ""
echo "Starting cleanup for project: $PROJECT_ID"

# Set project
gcloud config set project $PROJECT_ID

# Delete Cloud Run service
echo "Deleting Cloud Run service..."
if gcloud run services describe $SERVICE_NAME --region=$REGION >/dev/null 2>&1; then
    gcloud run services delete $SERVICE_NAME --region=$REGION --quiet
    echo "✓ Cloud Run service deleted"
else
    echo "- Cloud Run service not found (already deleted or never created)"
fi

# Delete Cloud SQL instance
echo "Deleting Cloud SQL instance..."
if gcloud sql instances describe $INSTANCE_NAME >/dev/null 2>&1; then
    echo "Warning: This will delete the database instance and ALL DATA!"
    read -p "Confirm database deletion (type DELETE to proceed): " db_confirmation
    
    if [ "$db_confirmation" = "DELETE" ]; then
        gcloud sql instances delete $INSTANCE_NAME --quiet
        echo "✓ Cloud SQL instance deleted"
    else
        echo "- Skipping database deletion"
    fi
else
    echo "- Cloud SQL instance not found (already deleted or never created)"
fi

# Delete secrets
echo "Deleting secrets..."
if gcloud secrets describe plainflags-db-password >/dev/null 2>&1; then
    gcloud secrets delete plainflags-db-password --quiet
    echo "✓ Secret deleted"
else
    echo "- Secret not found (already deleted or never created)"
fi

# Delete service account
echo "Deleting service account..."
if gcloud iam service-accounts describe $SA_EMAIL >/dev/null 2>&1; then
    gcloud iam service-accounts delete $SA_EMAIL --quiet
    echo "✓ Service account deleted"
else
    echo "- Service account not found (already deleted or never created)"
fi

# Clean up local files
echo "Cleaning up local files..."
if [ -f ".db-connection-name" ]; then
    rm .db-connection-name
    echo "✓ Removed .db-connection-name"
fi

echo ""
echo "🧹 Cleanup complete!"
echo ""
echo "Remaining items (not automatically removed):"
echo "- GCP APIs remain enabled (shared with other services)"
echo "- Local configuration files (instance-config, .secrets/)"
echo "- IAM policy bindings may need manual cleanup"
echo ""
echo "To check for any remaining resources:"
echo "gcloud run services list --region=$REGION"
echo "gcloud sql instances list"
echo "gcloud secrets list"