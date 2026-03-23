#!/bin/bash
# Deploy cloud test service to Cloud Run

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

SERVICE_NAME="plainflags-cloud-test"
SOURCE_DIR="../services/cloud-test"

# Get management service URL
MANAGEMENT_URL=""
if gcloud run services describe plainflags-management --region=$REGION >/dev/null 2>&1; then
    MANAGEMENT_URL=$(gcloud run services describe plainflags-management --region=$REGION --format="value(status.url)")
    echo "Found management service at: $MANAGEMENT_URL"
else
    echo "Warning: Management service not found. Please deploy it first or set MANAGEMENT_SERVICE_URL manually."
fi

echo "Deploying cloud test service..."
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"
echo "Source: $SOURCE_DIR"

# Set project
gcloud config set project $PROJECT_ID

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --source=$SOURCE_DIR \
    --platform=managed \
    --region=$REGION \
    --allow-unauthenticated \
    --set-env-vars="NODE_ENV=production" \
    --set-env-vars="MANAGEMENT_SERVICE_URL=${MANAGEMENT_URL}" \
    --memory=512Mi \
    --cpu=1 \
    --max-instances=5 \
    --timeout=300 \
    --port=8080

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo ""
echo "Deployment complete!"
echo "Cloud Test Service URL: $SERVICE_URL"
echo ""
echo "Test the service:"
echo "curl $SERVICE_URL/health"
echo ""
echo "Run tests:"
echo "curl -X POST $SERVICE_URL/api/run-tests"
echo ""
echo "Get test results:"
echo "curl $SERVICE_URL/api/test-results"
echo ""
echo "To delete this service when done:"
echo "./delete-cloud-test.sh"