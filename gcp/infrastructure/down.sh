#!/bin/bash
# Tear down all credit-consuming GCP resources by delegating to the individual
# delete scripts. Each script skips its own confirmation when passed --yes.

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

INSTANCE_NAME="plainflags-db"

echo "Deleting all credit-consuming resources from project: $PROJECT_ID"
read -p "Continue? (y/N): " confirmation

if [[ ! "$confirmation" =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 0
fi

gcloud config set project $PROJECT_ID

# ── Flag-states (function + service, whichever is present) ────────────────────
./delete-flag-states.sh --yes

# ── Management service ────────────────────────────────────────────────────────
if gcloud run services describe plainflags-management --region=$REGION >/dev/null 2>&1; then
    gcloud run services delete plainflags-management --region=$REGION --quiet
    echo "✓ Management service deleted"
else
    echo "- Management service not found"
fi

# ── Dashboard service ─────────────────────────────────────────────────────────
./delete-dashboard.sh

# ── Cloud test service ────────────────────────────────────────────────────────
./delete-cloud-test.sh --yes

# ── Cloud SQL instance ────────────────────────────────────────────────────────
if gcloud sql instances describe $INSTANCE_NAME >/dev/null 2>&1; then
    echo "WARNING: Database deletion will remove ALL DATA!"
    read -p "Type DELETE to confirm: " db_confirmation
    
    if [ "$db_confirmation" = "DELETE" ]; then
        gcloud sql instances delete $INSTANCE_NAME --quiet
        echo "✓ Cloud SQL instance deleted"
    else
        echo "- Database deletion cancelled"
        exit 1
    fi
else
    echo "- Cloud SQL instance not found"
fi

echo "Billing resources deleted"
