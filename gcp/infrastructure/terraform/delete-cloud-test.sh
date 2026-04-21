#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Must run from terraform directory so terraform output works
cd "$SCRIPT_DIR"

if ! command -v jq &>/dev/null; then
  echo "Error: jq is required but not found in PATH"
  exit 1
fi

echo "Reading Terraform outputs..."
TF_DEPLOY_NAMES=$(terraform output -json deployment_names)
TF_RUNTIME=$(terraform output -json runtime_config)

PROJECT_ID=$(echo "$TF_RUNTIME" | jq -r '.project_id')
REGION=$(echo "$TF_RUNTIME" | jq -r '.region')
SUFFIX=$(echo "$TF_DEPLOY_NAMES" | jq -r '.deployment_name_suffix')

SERVICE_NAME="plainflags-cloud-test-${SUFFIX}"

echo "Project: $PROJECT_ID"
echo "Region:  $REGION"
echo "Service: $SERVICE_NAME"
echo ""

gcloud run services delete "$SERVICE_NAME" \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --quiet

echo "Deleted: $SERVICE_NAME"
