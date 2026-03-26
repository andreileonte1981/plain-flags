#!/bin/bash
# Deploy flag-management service to Cloud Run

set -e

# Check for config file
if [ ! -f "config/instance-config" ]; then
    echo "Error: config/instance-config file not found"
    echo "Please copy config/instance-config.template to config/instance-config and fill in your values"
    exit 1
fi

# Read configuration
source ./config/instance-config

# Read database connection name
if [ ! -f ".db-connection-name" ]; then
    echo "Error: .db-connection-name file not found"
    echo "Please run './deploy-database.sh <password>' first"
    exit 1
fi

CONNECTION_NAME=$(cat .db-connection-name)

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "your-project-id-here" ]; then
    echo "Error: PROJECT_ID not set in config/instance-config"
    echo "Please edit config/instance-config and set your GCP project ID"
    exit 1
fi

if [ -z "$CONNECTION_NAME" ]; then
    echo "Error: Could not read database connection name"
    echo "Please ensure deploy-database.sh completed successfully"
    exit 1
fi

SERVICE_NAME="plainflags-management"
SOURCE_DIR="../services/flag-management"

echo "Deploying flag-management service..."
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"
echo "DB Connection: $CONNECTION_NAME"

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
    --set-env-vars="DB_CONNECTION_NAME=$CONNECTION_NAME" \
    --set-env-vars="DB_NAME=plainflags" \
    --set-env-vars="DB_USER=plainflags" \
    --set-env-vars="SUPERADMIN_EMAIL=${SUPERADMIN_EMAIL}" \
    --set-env-vars="FIREBASE_PROJECT_ID=${PROJECT_ID}" \
    --set-secrets=DB_PASSWORD=plainflags-db-password:latest \
    --add-cloudsql-instances=$CONNECTION_NAME \
    --memory=512Mi \
    --cpu=1 \
    --max-instances=10 \
    --port=8080

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo ""
echo "Deployment complete!"
echo "Service URL: $SERVICE_URL"
echo ""
echo "Test the service:"
echo "curl $SERVICE_URL/health"
