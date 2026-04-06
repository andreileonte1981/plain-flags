#!/bin/bash
# Deploy flag-states as a 1st gen HTTP Cloud Function or a Cloud Run service.
# Set STATES_VARIANT in config/instance-config:
#   function  — 1st gen Cloud Function (scales to zero, cold starts possible)
#   service   — Cloud Run service with min-instances=1 (always on, no cold starts)

set -e

# Check for config file
if [ ! -f "config/instance-config" ]; then
    echo "Error: config/instance-config file not found"
    echo "Please copy config/instance-config.template to config/instance-config and fill in your values"
    exit 1
fi

source ./config/instance-config

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "your-gcp-project-id-here" ]; then
    echo "Error: PROJECT_ID not set in config/instance-config"
    exit 1
fi

# Read database connection name
if [ ! -f ".db-connection-name" ]; then
    echo "Error: .db-connection-name file not found"
    echo "Please run './deploy-database.sh' first"
    exit 1
fi

CONNECTION_NAME=$(cat .db-connection-name)

if [ -z "$CONNECTION_NAME" ]; then
    echo "Error: Could not read database connection name"
    exit 1
fi

# Read API key for SDK clients
if [ ! -f ".secrets/apikey.states.txt" ]; then
    echo "Error: .secrets/apikey.states.txt not found"
    echo "Please create that file and put a strong random API key in it."
    echo "  Example: openssl rand -hex 32 > .secrets/apikey.states.txt"
    exit 1
fi

APIKEY=$(cat .secrets/apikey.states.txt | tr -d '[:space:]')

if [ -z "$APIKEY" ]; then
    echo "Error: .secrets/apikey.states.txt is empty"
    exit 1
fi

VARIANT="${STATES_VARIANT:-function}"

if [[ "$VARIANT" != "function" && "$VARIANT" != "service" ]]; then
    echo "Error: STATES_VARIANT must be 'function' or 'service' (got: '$VARIANT')"
    exit 1
fi

NAME="plainflags-states"
SECRET_NAME="plainflags-states-apikey"
SA_EMAIL="plainflags-runner@${PROJECT_ID}.iam.gserviceaccount.com"

echo "Deploying flag-states ($VARIANT)..."
echo "Project:     $PROJECT_ID"
echo "Name:        $NAME"
echo "Region:      $REGION"
echo "DB instance: $CONNECTION_NAME"

gcloud config set project "$PROJECT_ID"

# ── Create / update the API key secret in Secret Manager ─────────────────────
if gcloud secrets describe "$SECRET_NAME" --project="$PROJECT_ID" >/dev/null 2>&1; then
    echo "Updating existing secret $SECRET_NAME..."
    echo -n "$APIKEY" | gcloud secrets versions add "$SECRET_NAME" --data-file=-
else
    echo "Creating secret $SECRET_NAME..."
    echo -n "$APIKEY" | gcloud secrets create "$SECRET_NAME" \
        --data-file=- \
        --replication-policy=automatic
fi

# Grant the service account access to the secret
gcloud secrets add-iam-policy-binding "$SECRET_NAME" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet

# ── Deploy ────────────────────────────────────────────────────────────────────
if [[ "$VARIANT" == "function" ]]; then
    gcloud functions deploy "$NAME" \
        --runtime nodejs22 \
        --trigger-http \
        --allow-unauthenticated \
        --region "$REGION" \
        --source "../services/flag-states" \
        --entry-point flagStates \
        --service-account "$SA_EMAIL" \
        --set-env-vars "CLOUD_SQL_CONNECTION_NAME=${CONNECTION_NAME},DB_NAME=plainflags,DB_USER=plainflags" \
        --set-secrets "DB_PASSWORD=plainflags-db-password:latest,APIKEY=${SECRET_NAME}:latest" \
        --memory 256MB \
        --timeout 10s \
        --max-instances 10

    SERVICE_URL="https://${REGION}-${PROJECT_ID}.cloudfunctions.net/${NAME}"
else
    gcloud run deploy "$NAME" \
        --source "../services/flag-states-run" \
        --platform managed \
        --region "$REGION" \
        --allow-unauthenticated \
        --service-account "$SA_EMAIL" \
        --set-env-vars "CLOUD_SQL_CONNECTION_NAME=${CONNECTION_NAME},DB_NAME=plainflags,DB_USER=plainflags" \
        --set-secrets "DB_PASSWORD=plainflags-db-password:latest,APIKEY=${SECRET_NAME}:latest" \
        --memory 512Mi \
        --cpu 1 \
        --min-instances 1 \
        --max-instances 10 \
        --port 8080

    SERVICE_URL=$(gcloud run services describe "$NAME" --region "$REGION" --format="value(status.url)")
fi

# ── Print usage info ──────────────────────────────────────────────────────────
echo ""
echo "Deployment complete!"
echo ""
echo "URL: $SERVICE_URL"
echo ""
echo "SDK configuration:"
echo "  serviceUrl: $SERVICE_URL"
echo "  apiKey:     $APIKEY"
echo ""
echo "Test:"
echo "  curl -H \"x-api-key: ${APIKEY}\" ${SERVICE_URL}/api/sdk"
