#!/bin/bash
# Deploy all Plain Flags services to GCP
# This script deploys database, management service, dashboard and test service in order

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

# Function to check if a password was provided
check_db_password() {
    if [ -z "$1" ]; then
        echo "Usage: $0 <database-password>"
        echo "Example: $0 MySecurePassword123!"
        exit 1
    fi
}

# Check if database password provided
if [ $# -eq 0 ]; then
    echo "Database password required for first deployment"
    echo "Usage: $0 <database-password>"
    echo "Example: $0 MySecurePassword123!"
    echo ""
    echo "If you're redeploying and database already exists, you can skip database deployment:"
    echo "$0 --skip-db"
    exit 1
fi

DB_PASSWORD="$1"
SKIP_DB=false

if [ "$1" = "--skip-db" ]; then
    SKIP_DB=true
    DB_PASSWORD=""
fi

echo "Deploying Plain Flags to GCP..."
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Set project
gcloud config set project $PROJECT_ID

# Step 1: Deploy Database (if not skipping)
if [ "$SKIP_DB" = false ]; then
    echo "===================="
    echo "1. Deploying Database..."
    echo "===================="
    ./deploy-database.sh "$DB_PASSWORD"
    echo "✓ Database deployed successfully"
    echo ""
else
    echo "===================="
    echo "1. Skipping Database (already exists)"
    echo "===================="
    echo ""
fi

# Step 2: Deploy Management Service
echo "===================="
echo "2. Deploying Management Service..."
echo "===================="
./deploy-flag-management.sh
echo "✓ Management service deployed successfully"
echo ""

# Step 3: Deploy Dashboard
echo "===================="
echo "3. Deploying Dashboard..."
echo "===================="
./deploy-dashboard.sh
echo "✓ Dashboard deployed successfully"
echo ""

# Step 4: Deploy Test Service
echo "===================="
echo "4. Deploying Test Service..."
echo "===================="
./deploy-cloud-test.sh
echo "✓ Test service deployed successfully"
echo ""

# Get service URLs
MANAGEMENT_URL=$(gcloud run services describe plainflags-management --region=$REGION --format="value(status.url)")
DASHBOARD_URL=$(gcloud run services describe plainflags-dashboard --region=$REGION --format="value(status.url)")
TEST_URL=$(gcloud run services describe plainflags-cloud-test --region=$REGION --format="value(status.url)")

echo "===================="
echo "🎉 Deployment Complete!"
echo "===================="
echo ""
echo "Service URLs:"
echo "  Management API: $MANAGEMENT_URL"
echo "  Dashboard:      $DASHBOARD_URL"
echo "  Test Service:   $TEST_URL"
echo ""
echo "Quick Test Commands:"
echo "  curl $MANAGEMENT_URL/health"
echo "  curl $TEST_URL/health"
echo ""
echo "To delete all services when done:"
echo "  ./cleanup-billing-resources.sh"
echo ""
echo "Dashboard should be opening in your browser shortly..."