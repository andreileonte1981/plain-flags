#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
FIREBASE_ENV_FILE="$REPO_ROOT/gcp/infrastructure/.secrets/firebase.env"

# Must run from terraform directory so terraform output works
cd "$SCRIPT_DIR"

if ! command -v jq &>/dev/null; then
  echo "Error: jq is required but not found in PATH"
  exit 1
fi

if [ ! -f "$FIREBASE_ENV_FILE" ]; then
  echo "Error: $FIREBASE_ENV_FILE not found"
  echo "Run the firebase setup first so FIREBASE_API_KEY, TEST_USER_EMAIL, and TEST_USER_PASSWORD are available."
  exit 1
fi

set -a
source "$FIREBASE_ENV_FILE"
set +a

if [ -z "$FIREBASE_API_KEY" ] || [ -z "$TEST_USER_EMAIL" ] || [ -z "$TEST_USER_PASSWORD" ]; then
  echo "Error: firebase.env is missing one or more required values: FIREBASE_API_KEY, TEST_USER_EMAIL, TEST_USER_PASSWORD"
  exit 1
fi

echo "Reading Terraform outputs..."
TF_SERVICE_URLS=$(terraform output -json service_urls)
TF_DEPLOY_NAMES=$(terraform output -json deployment_names)
TF_RUNTIME=$(terraform output -json runtime_config)
TF_SECRETS=$(terraform output -json generated_secrets)
SA_EMAIL=$(terraform output -raw service_account_email)

PROJECT_ID=$(echo "$TF_RUNTIME" | jq -r '.project_id')
REGION=$(echo "$TF_RUNTIME" | jq -r '.region')
MANAGEMENT_URL=$(echo "$TF_SERVICE_URLS" | jq -r '.management')
STATES_SERVICE_URL=$(echo "$TF_SERVICE_URLS" | jq -r '.states')
STATES_APIKEY=$(echo "$TF_SECRETS" | jq -r '.states_apikey')
SUFFIX=$(echo "$TF_DEPLOY_NAMES" | jq -r '.deployment_name_suffix')

SERVICE_NAME="plainflags-cloud-test-${SUFFIX}"

echo "Project:    $PROJECT_ID"
echo "Region:     $REGION"
echo "Service:    $SERVICE_NAME"
echo "Management: $MANAGEMENT_URL"
echo "States URL: $STATES_SERVICE_URL"
echo ""

gcloud run deploy "$SERVICE_NAME" \
  --source "$REPO_ROOT/gcp/services/cloud-test" \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --service-account "$SA_EMAIL" \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "MANAGEMENT_SERVICE_URL=${MANAGEMENT_URL}" \
  --set-env-vars "FIREBASE_API_KEY=${FIREBASE_API_KEY}" \
  --set-env-vars "TEST_USER_EMAIL=${TEST_USER_EMAIL}" \
  --set-env-vars "TEST_USER_PASSWORD=${TEST_USER_PASSWORD}" \
  --set-env-vars "STATES_SERVICE_URL=${STATES_SERVICE_URL}" \
  --set-env-vars "STATES_APIKEY=${STATES_APIKEY}" \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 5 \
  --timeout 300 \
  --port 8080

SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region="$REGION" --project="$PROJECT_ID" --format="value(status.url)")

echo ""
echo "Deployment complete"
echo "Cloud Test Service URL: $SERVICE_URL"
echo ""

echo "Running tests..."
echo "POST $SERVICE_URL/api/run-tests"
TEST_RESULT=$(curl -s -X POST "$SERVICE_URL/api/run-tests" 2>/dev/null || true)

if [ -n "$TEST_RESULT" ]; then
  echo ""
  echo "=== TEST RESULTS ==="
  echo "$TEST_RESULT" | jq '.' 2>/dev/null || echo "$TEST_RESULT"
  echo ""
  echo "Test results available at: $SERVICE_URL/api/test-results"
else
  echo "Failed to run tests automatically. You can run them manually:"
  echo "curl -X POST $SERVICE_URL/api/run-tests"
fi

echo ""
echo "Manual commands:"
echo "curl $SERVICE_URL/health"
echo "curl -X POST $SERVICE_URL/api/run-tests"
echo "curl $SERVICE_URL/api/test-results"
