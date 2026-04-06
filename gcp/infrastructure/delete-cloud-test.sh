#!/bin/bash
# Delete cloud test service from Cloud Run
#
# Usage: ./delete-cloud-test.sh [--yes]
#   --yes  Skip the confirmation prompt (used when called from down.sh)

set -e

YES=false
for arg in "$@"; do
    [[ "$arg" == "--yes" ]] && YES=true
done

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

SERVICE_NAME="plainflags-cloud-test"

if [[ "$YES" != true ]]; then
    echo "Deleting cloud test service from project: $PROJECT_ID"
    read -p "Continue? (y/N): " confirmation
    if [[ ! "$confirmation" =~ ^[Yy]$ ]]; then
        echo "Cancelled"
        exit 0
    fi
fi

# Set project
gcloud config set project $PROJECT_ID

# Delete Cloud Run service
if gcloud run services describe $SERVICE_NAME --region=$REGION >/dev/null 2>&1; then
    gcloud run services delete $SERVICE_NAME --region=$REGION --quiet
    echo "✓ Cloud test service deleted"
else
    echo "- Cloud test service not found"
fi

echo "Cloud test service cleanup complete"