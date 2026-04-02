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

echo "Deploying Plain Flags to GCP... (including cloud tests)"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Set project
gcloud config set project $PROJECT_ID

echo "===================="
echo "Deploying Database..."
echo "===================="
./deploy-database.sh
echo "✓ Database deployed successfully"
echo ""

echo "===================="
echo "Deploying Management Service..."
echo "===================="
./deploy-flag-management.sh
echo "✓ Management service deployed successfully"
echo ""

echo "===================="
echo "Deploying States Service..."
echo "===================="
./deploy-flag-states.sh
echo "✓ States service deployed successfully"
echo ""

echo "===================="
echo "Deploying Test Service..."
echo "===================="
./deploy-cloud-test.sh
echo "✓ Test service deployed successfully"
echo ""

echo "===================="
echo "Deploying Dashboard..."
echo "===================="
./deploy-dashboard.sh
echo "✓ Dashboard deployed successfully"
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
echo "Dashboard should be opening in your browser shortly..."