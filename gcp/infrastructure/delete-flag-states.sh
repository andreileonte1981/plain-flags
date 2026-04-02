#!/bin/bash
# Delete the flag-states Cloud Function and optionally its Secret Manager secret

set -e

if [ ! -f "config/instance-config" ]; then
    echo "Error: config/instance-config file not found"
    exit 1
fi

source ./config/instance-config

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "your-gcp-project-id-here" ]; then
    echo "Error: PROJECT_ID not set in config/instance-config"
    exit 1
fi

FUNCTION_NAME="plainflags-states"
SECRET_NAME="plainflags-states-apikey"

echo "This will delete:"
echo "  - Cloud Function: $FUNCTION_NAME (region: $REGION)"
echo ""
read -r -p "Are you sure? (y/N): " confirmation

if [[ ! "$confirmation" =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

gcloud config set project "$PROJECT_ID"

# ── Delete the function ───────────────────────────────────────────────────────
if gcloud functions describe "$FUNCTION_NAME" --region "$REGION" >/dev/null 2>&1; then
    echo "Deleting function $FUNCTION_NAME..."
    gcloud functions delete "$FUNCTION_NAME" --region "$REGION" --quiet
    echo "  Function deleted."
else
    echo "  Function $FUNCTION_NAME not found — skipping."
fi

# ── Optionally delete the API key secret ─────────────────────────────────────
echo ""
read -r -p "Also delete Secret Manager secret '$SECRET_NAME'? (y/N): " del_secret

if [[ "$del_secret" =~ ^[Yy]$ ]]; then
    if gcloud secrets describe "$SECRET_NAME" --project="$PROJECT_ID" >/dev/null 2>&1; then
        gcloud secrets delete "$SECRET_NAME" --project="$PROJECT_ID" --quiet
        echo "  Secret $SECRET_NAME deleted."
    else
        echo "  Secret $SECRET_NAME not found — skipping."
    fi
fi

echo ""
echo "Done."
