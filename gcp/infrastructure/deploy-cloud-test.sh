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

if [ ! -f ".secrets/firebase.env" ]; then
    echo "Error: .secrets/firebase.env not found. Run setup-firebase.sh first."
    exit 1
fi
source ./.secrets/firebase.env

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

# Get states function URL (1st gen CF — URL is deterministic)
STATES_SERVICE_URL="https://${REGION}-${PROJECT_ID}.cloudfunctions.net/plainflags-states"
echo "States service URL: $STATES_SERVICE_URL"

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
    --service-account=plainflags-runner@$PROJECT_ID.iam.gserviceaccount.com \
    --set-env-vars="NODE_ENV=production" \
    --set-env-vars="MANAGEMENT_SERVICE_URL=${MANAGEMENT_URL}" \
    --set-env-vars="FIREBASE_API_KEY=${FIREBASE_API_KEY}" \
    --set-env-vars="TEST_USER_EMAIL=${TEST_USER_EMAIL}" \
    --set-env-vars="TEST_USER_PASSWORD=${TEST_USER_PASSWORD}" \
    --set-env-vars="STATES_SERVICE_URL=${STATES_SERVICE_URL}" \
    --set-secrets="STATES_APIKEY=plainflags-states-apikey:latest" \
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

# Run tests automatically
echo "Running tests..."
echo "POST $SERVICE_URL/api/run-tests"
TEST_RESULT=$(curl -s -X POST "$SERVICE_URL/api/run-tests" 2>/dev/null)

if [ $? -eq 0 ] && [ -n "$TEST_RESULT" ]; then
    echo ""
    echo "=== TEST RESULTS ==="
    echo "$TEST_RESULT" | jq '.' 2>/dev/null || echo "$TEST_RESULT"
    echo ""
    
    # Try to open test results in browser
    RESULTS_URL="$SERVICE_URL/api/test-results"
    echo "Test results available at: $RESULTS_URL"
    
    if command -v xdg-open >/dev/null 2>&1; then
        echo "Opening test results in browser..."
        xdg-open "$RESULTS_URL" >/dev/null 2>&1 &
    elif command -v open >/dev/null 2>&1; then
        echo "Opening test results in browser..."
        open "$RESULTS_URL" >/dev/null 2>&1 &
    else
        echo "Browser opening not available. Visit the URL above manually."
    fi
else
    echo "Failed to run tests automatically. You can run them manually:"
    echo "curl -X POST $SERVICE_URL/api/run-tests"
fi

echo ""
echo "Manual commands:"
echo "curl $SERVICE_URL/health"
echo "curl -X POST $SERVICE_URL/api/run-tests"
echo "curl $SERVICE_URL/api/test-results"
echo ""
echo "To delete this service when done:"
echo "./delete-cloud-test.sh"