#!/bin/bash
# Deploy all Plain Flags services to GCP

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

echo "Deploying Plain Flags to GCP..."
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
echo "Deploying Dashboard..."
echo "===================="
./deploy-dashboard.sh
echo "✓ Dashboard deployed successfully"
echo ""

# Get service URLs
MANAGEMENT_URL=$(gcloud run services describe plainflags-management --region=$REGION --format="value(status.url)")
DASHBOARD_URL=$(gcloud run services describe plainflags-dashboard --region=$REGION --format="value(status.url)")

echo "===================="
echo "🎉 Deployment Complete!"
echo "===================="
echo ""
echo "Service URLs:"
echo "  Management API: $MANAGEMENT_URL"
echo "    Pass this URL to the mobile app when connecting"
echo ""
echo "  Dashboard:      $DASHBOARD_URL"
echo ""
echo "Dashboard should be opening in your browser shortly..."