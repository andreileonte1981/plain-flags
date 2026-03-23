#!/bin/bash
# Cleanup script to remove only the credit-consuming GCP resources
# This script deletes only the Cloud Run service and Cloud SQL database

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

echo "Deleting credit-consuming resources from project: $PROJECT_ID"
read -p "Continue? (y/N): " confirmation

if [[ ! "$confirmation" =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 0
fi

gcloud config set project $PROJECT_ID

# Delete Cloud Run service
if gcloud run services describe $SERVICE_NAME --region=$REGION >/dev/null 2>&1; then
    gcloud run services delete $SERVICE_NAME --region=$REGION --quiet
    echo "✓ Cloud Run service deleted"
else
    echo "- Cloud Run service not found"
fi

# Delete Cloud SQL instance
if gcloud sql instances describe $INSTANCE_NAME >/dev/null 2>&1; then
    echo "WARNING: Database deletion will remove ALL DATA!"
    read -p "Type DELETE to confirm: " db_confirmation
    
    if [ "$db_confirmation" = "DELETE" ]; then
        gcloud sql instances delete $INSTANCE_NAME --quiet
        echo "✓ Cloud SQL instance deleted"
    else
        echo "- Database deletion cancelled"
        exit 1
    fi
else
    echo "- Cloud SQL instance not found"
fi

echo "Billing resources deleted"
