#!/bin/bash
# Deploy dashboard to Cloud Run

set -e

# Check for config file
if [ ! -f "config/instance-config" ]; then
    echo "Error: config/instance-config file not found"
    echo "Please ensure you're in the correct directory with config/instance-config"
    exit 1
fi

# Read configuration
source ./config/instance-config

# Read Firebase secrets
if [ ! -f ".secrets/firebase.env" ]; then
    echo "Error: .secrets/firebase.env not found"
    echo "Please run './setup-firebase.sh' first to configure Firebase."
    exit 1
fi
source ./.secrets/firebase.env

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "your-project-id-here" ]; then
    echo "Error: PROJECT_ID not set in instance-config"
    exit 1
fi

SERVICE_NAME="plainflags-dashboard"
SOURCE_DIR="../services/dashboard"

# Get management service URL
MANAGEMENT_URL=""
if gcloud run services describe plainflags-management --region=$REGION >/dev/null 2>&1; then
    MANAGEMENT_URL=$(gcloud run services describe plainflags-management --region=$REGION --format="value(status.url)")
    echo "Found management service at: $MANAGEMENT_URL"
else
    echo "Warning: Management service not found. Please deploy it first."
    exit 1
fi

echo "Deploying dashboard..."
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"
echo "Source: $SOURCE_DIR"
echo "Management API: $MANAGEMENT_URL"

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
    --set-env-vars="FIREBASE_PROJECT_ID=${PROJECT_ID}" \
    --set-env-vars="FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN}" \
    --set-env-vars="FIREBASE_API_KEY=${FIREBASE_API_KEY}" \
    --set-env-vars="FIREBASE_APP_ID=${FIREBASE_APP_ID}" \
    --memory=512Mi \
    --cpu=1 \
    --max-instances=10 \
    --timeout=300 \
    --port=8080

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo ""
echo "Deployment complete!"
echo "Dashboard URL: $SERVICE_URL"
echo ""

# Try to open dashboard in browser
echo "Opening dashboard in browser..."
if command -v xdg-open >/dev/null 2>&1; then
    echo "Opening dashboard in browser..."
    xdg-open "$SERVICE_URL" >/dev/null 2>&1 &
elif command -v open >/dev/null 2>&1; then
    echo "Opening dashboard in browser..."
    open "$SERVICE_URL" >/dev/null 2>&1 &
else
    echo "Browser opening not available. Visit the URL above manually."
fi

echo ""
echo "To delete this service when done:"
echo "./delete-dashboard.sh"