#!/bin/bash
# Delete dashboard service from Cloud Run

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

SERVICE_NAME="plainflags-dashboard"

echo "Deleting dashboard service..."
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"

# Set project
gcloud config set project $PROJECT_ID

# Check if service exists
if ! gcloud run services describe $SERVICE_NAME --region=$REGION >/dev/null 2>&1; then
    echo "Service $SERVICE_NAME does not exist in region $REGION"
    exit 0
fi

# Delete the service
echo "Deleting Cloud Run service..."
gcloud run services delete $SERVICE_NAME --region=$REGION --quiet

echo ""
echo "Dashboard service deleted successfully!"