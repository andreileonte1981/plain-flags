#!/bin/bash
# Deploy Cloud SQL PostgreSQL database for Plain Flags

set -e

# Check for config file
if [ ! -f "config/instance-config" ]; then
    echo "Error: config/instance-config file not found"
    echo "Please copy config/instance-config.template to config/instance-config and fill in your values"
    exit 1
fi

# Read configuration
source ./config/instance-config

DB_PASSWORD=${1:-}

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "your-project-id-here" ]; then
    echo "Error: PROJECT_ID not set in config/instance-config"
    echo "Please edit config/instance-config and set your GCP project ID"
    exit 1
fi

# Check for password file first, then command line parameter
if [ -f ".secrets/password.pg.txt" ] && [ -z "$DB_PASSWORD" ]; then
    DB_PASSWORD=$(cat .secrets/password.pg.txt)
    echo "Using database password from .secrets/password.pg.txt"
elif [ -z "$DB_PASSWORD" ]; then
    echo "Usage: $0 [database-password]"
    echo "Provide password either as parameter or in .secrets/password.pg.txt"
    echo "Example: $0 mySecurePassword123"
    exit 1
fi

INSTANCE_NAME="plainflags-db"
DATABASE_NAME="plainflags"
DB_USER="plainflags"

echo "Setting up Cloud SQL PostgreSQL..."
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Instance: $INSTANCE_NAME"

# Set project
gcloud config set project $PROJECT_ID

echo "Creating Cloud SQL instance..."
gcloud sql instances create $INSTANCE_NAME \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=$REGION \
    --storage-size=10GB \
    --storage-auto-increase \
    --backup-start-time=02:00 \
    --authorized-networks=0.0.0.0/0

echo "Waiting for instance to be ready..."
sleep 30

echo "Setting root password..."
gcloud sql users set-password postgres \
    --instance=$INSTANCE_NAME \
    --password=$DB_PASSWORD

echo "Creating application user..."
gcloud sql users create $DB_USER \
    --instance=$INSTANCE_NAME \
    --password=$DB_PASSWORD

echo "Creating application database..."
gcloud sql databases create $DATABASE_NAME \
    --instance=$INSTANCE_NAME

echo "Storing database password in Secret Manager..."
if gcloud secrets describe plainflags-db-password >/dev/null 2>&1; then
    echo "Secret already exists, updating value..."
    echo -n "$DB_PASSWORD" | gcloud secrets versions add plainflags-db-password --data-file=-
else
    echo -n "$DB_PASSWORD" | gcloud secrets create plainflags-db-password --data-file=-
fi

# Get instance connection name
CONNECTION_NAME=$(gcloud sql instances describe $INSTANCE_NAME --format="value(connectionName)")

# Save connection name for use by other scripts
echo "$CONNECTION_NAME" > .db-connection-name

echo ""
echo "Database setup complete!"
echo "Connection name saved to .db-connection-name"
echo ""
echo "Next step: Run './deploy-flag-management.sh' to deploy the service"