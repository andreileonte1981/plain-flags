#!/bin/bash
# Delete the flag-states Cloud Function and Cloud Run service (tries both).
#
# Usage: ./delete-flag-states.sh [--yes]
#   --yes  Skip the confirmation prompt (used when called from down.sh)

set -e

YES=false
for arg in "$@"; do
    [[ "$arg" == "--yes" ]] && YES=true
done

if [ ! -f "config/instance-config" ]; then
    echo "Error: config/instance-config file not found"
    exit 1
fi

source ./config/instance-config

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "your-gcp-project-id-here" ]; then
    echo "Error: PROJECT_ID not set in config/instance-config"
    exit 1
fi

NAME="plainflags-states"
SECRET_NAME="plainflags-states-apikey"

if [[ "$YES" != true ]]; then
    echo "This will delete (if present):"
    echo "  - Cloud Function: $NAME (region: $REGION)"
    echo "  - Cloud Run service: $NAME (region: $REGION)"
    echo ""
    read -r -p "Are you sure? (y/N): " confirmation
    if [[ ! "$confirmation" =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 0
    fi
fi

gcloud config set project "$PROJECT_ID"

# ── Delete the Cloud Function ─────────────────────────────────────────────────
if gcloud functions describe "$NAME" --region "$REGION" >/dev/null 2>&1; then
    echo "Deleting Cloud Function $NAME..."
    gcloud functions delete "$NAME" --region "$REGION" --quiet
    echo "  Function deleted."
else
    echo "  Cloud Function $NAME not found — skipping."
fi

# ── Delete the Cloud Run service ──────────────────────────────────────────────
if gcloud run services describe "$NAME" --region "$REGION" >/dev/null 2>&1; then
    echo "Deleting Cloud Run service $NAME..."
    gcloud run services delete "$NAME" --region "$REGION" --quiet
    echo "  Service deleted."
else
    echo "  Cloud Run service $NAME not found — skipping."
fi

# ── Optionally delete the API key secret (skipped when --yes) ────────────────
if [[ "$YES" != true ]]; then
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
fi

echo ""
echo "Done."
