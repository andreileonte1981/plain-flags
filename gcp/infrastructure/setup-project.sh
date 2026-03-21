#!/bin/bash
# Setup GCP project with required APIs and services

set -e

# Check for config file
if [ ! -f "instance-config" ]; then
    echo "Error: instance-config file not found"
    echo "Please copy instance-config.template to instance-config and fill in your values"
    exit 1
fi

# Read configuration
source ./instance-config

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "your-project-id-here" ]; then
    echo "Error: PROJECT_ID not set in instance-config"
    echo "Please edit instance-config and set your GCP project ID"
    exit 1
fi

echo "Setting up GCP project: $PROJECT_ID"
echo "Region: $REGION"

# Set project
gcloud config set project $PROJECT_ID

# Check billing is enabled
echo "Checking billing status..."
BILLING_ACCOUNT=$(gcloud beta billing projects describe $PROJECT_ID --format="value(billingAccountName)" 2>/dev/null || echo "")
if [ -z "$BILLING_ACCOUNT" ]; then
    echo "Warning: No billing account found for project $PROJECT_ID"
    echo "Cloud SQL requires billing to be enabled. Please:"
    echo "1. Go to https://console.cloud.google.com/billing/linkedaccount?project=$PROJECT_ID"
    echo "2. Link a billing account to your project"
    echo "3. Re-run this script"
else
    echo "✓ Billing is enabled"
fi

# Enable required APIs
echo "Enabling required APIs..."

# Enable basic APIs first
echo "Enabling basic APIs..."
for service in serviceusage.googleapis.com run.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com; do
    if gcloud services list --enabled --filter="name:$service" --format="value(name)" | grep -q "$service"; then
        echo "✓ $service already enabled"
    else
        echo "Enabling $service..."
        gcloud services enable $service
    fi
done

# Enable Cloud SQL API (requires billing and additional permissions)
echo "Checking Cloud SQL API..."
if gcloud services list --enabled --filter="name:sqladmin.googleapis.com" --format="value(name)" | grep -q "sqladmin.googleapis.com"; then
    echo "✓ sqladmin.googleapis.com already enabled"
else
    echo "Enabling sqladmin.googleapis.com..."
    if ! gcloud services enable sqladmin.googleapis.com; then
        echo "Warning: Failed to enable sqladmin.googleapis.com"
        echo "This usually means:"
        echo "1. Billing is not enabled for the project"
        echo "2. You need 'Service Usage Admin' role"
        echo "3. Organization policies may be restricting API usage"
        echo ""
        echo "Manual steps to fix:"
        echo "1. Enable billing: https://console.cloud.google.com/billing/linkedaccount?project=$PROJECT_ID"
        echo "2. Add Service Usage Admin role to your account"
        echo "3. Enable API manually: https://console.cloud.google.com/apis/library/sqladmin.googleapis.com?project=$PROJECT_ID"
        echo ""
        echo "Then re-run this script or continue manually."
        exit 1
    fi
fi

# Create service account for Cloud Run services
echo "Creating service account..."
gcloud iam service-accounts create plainflags-runner \
    --description="Service account for Plain Flags Cloud Run services" \
    --display-name="Plain Flags Runner"

# Grant necessary permissions
echo "Granting permissions..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:plainflags-runner@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:plainflags-runner@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

echo "GCP project setup complete!"
echo "✓ All required APIs are enabled"
echo "✓ Service account created with proper permissions"
echo ""
echo "Next step: Run './deploy-database.sh' to set up the database"