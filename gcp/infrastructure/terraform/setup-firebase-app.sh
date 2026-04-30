#!/bin/bash
# Set up a Firebase Web App for Plain Flags Terraform consumers.
#
# This script (step 1 of 2):
#   - Adds Firebase to a GCP project (idempotent)
#   - Creates or reuses a dedicated Firebase Web App for Plain Flags
#   - Optionally reuses an explicitly selected existing Firebase Web App
#   - Prints Terraform-ready values and writes them to a generated tfvars file
#   - Directs you to initialise Firebase Authentication manually before running
#     setup-firebase-auth.sh (step 2)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

PROJECT_ID=""
REGION=""
APP_ID=""
APP_DISPLAY_NAME="Plain Flags Dashboard"
OUTPUT_FILE="$SCRIPT_DIR/plainflags.firebase.tfvars"

usage() {
    cat <<EOF
Usage: $(basename "$0") --project <gcp-project-id> --region <gcp-region> [options]

Options:
  --project <id>            GCP project id to configure for Plain Flags
  --region <region>         Region to emit in the generated Terraform values
  --app-id <firebase-app>   Reuse an existing Firebase Web App by explicit app id
  --app-display-name <name> Dedicated Plain Flags web app display name
                            Default: Plain Flags Dashboard
  --output-file <path>      Path to generated tfvars file
                            Default: gcp/infrastructure/terraform/plainflags.firebase.tfvars
  --help                    Show this help text

Behavior:
  - By default, this script creates or reuses a dedicated Plain Flags Firebase Web App.
  - Existing arbitrary Firebase Web Apps are never reused implicitly.
  - To intentionally share Firebase users with another app, pass --app-id explicitly.

Two-step setup:
  1. Run this script to create the app and generate Terraform values.
  2. Visit the Firebase Console URL printed at the end and click "Get started" to
     initialise Firebase Authentication.
  3. Run setup-firebase-auth.sh --project <id> to configure the auth policy.
EOF
}

die() {
    echo "Error: $*" >&2
    exit 1
}

require_command() {
    if ! command -v "$1" >/dev/null 2>&1; then
        die "'$1' is required but not installed"
    fi
}

json_field() {
    local json_input="$1"
    local jq_expr="$2"
    echo "$json_input" | jq -r "$jq_expr"
}

parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --project)
                [[ $# -ge 2 ]] || die "--project requires a value"
                PROJECT_ID="$2"
                shift 2
                ;;
            --region)
                [[ $# -ge 2 ]] || die "--region requires a value"
                REGION="$2"
                shift 2
                ;;
            --app-id)
                [[ $# -ge 2 ]] || die "--app-id requires a value"
                APP_ID="$2"
                shift 2
                ;;
            --app-display-name)
                [[ $# -ge 2 ]] || die "--app-display-name requires a value"
                APP_DISPLAY_NAME="$2"
                shift 2
                ;;
            --output-file)
                [[ $# -ge 2 ]] || die "--output-file requires a value"
                OUTPUT_FILE="$2"
                shift 2
                ;;
            --help|-h)
                usage
                exit 0
                ;;
            *)
                die "Unknown argument: $1"
                ;;
        esac
    done

    [[ -n "$PROJECT_ID" ]] || die "--project is required"
    [[ -n "$REGION" ]] || die "--region is required"
}

require_command gcloud
require_command jq
parse_args "$@"

ACCESS_TOKEN="$(gcloud auth print-access-token 2>/dev/null || true)"
[[ -n "$ACCESS_TOKEN" ]] || die "Could not obtain an access token from gcloud. Run 'gcloud auth login' first."

CURL_HEADERS=(
    -H "Authorization: Bearer $ACCESS_TOKEN"
    -H "x-goog-user-project: ${PROJECT_ID}"
    -H "Content-Type: application/json"
)

mkdir -p "$(dirname "$OUTPUT_FILE")"

echo "Configuring Firebase for Plain Flags"
echo "Project: $PROJECT_ID"
echo "Region:  $REGION"
if [[ -n "$APP_ID" ]]; then
    echo "Mode:    reuse explicit app id $APP_ID"
else
    echo "Mode:    dedicated Plain Flags app ($APP_DISPLAY_NAME)"
fi
echo ""

echo "Adding Firebase to project if needed..."
ADD_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    "https://firebase.googleapis.com/v1beta1/projects/${PROJECT_ID}:addFirebase" \
    "${CURL_HEADERS[@]}" \
    -d '{}')

HTTP_CODE=$(echo "$ADD_RESPONSE" | tail -1)
BODY=$(echo "$ADD_RESPONSE" | head -n -1)

if [[ "$HTTP_CODE" == "200" ]]; then
    echo "✓ Firebase added to project"
elif echo "$BODY" | jq -e '.error.status == "ALREADY_EXISTS"' >/dev/null 2>&1; then
    echo "✓ Firebase already enabled on project"
else
    echo "Warning: unexpected response when adding Firebase (HTTP $HTTP_CODE)"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    echo "Continuing..."
fi

echo "Waiting for Firebase project to become active..."
for i in $(seq 1 12); do
    FB_PROJECT=$(curl -s \
        "https://firebase.googleapis.com/v1beta1/projects/${PROJECT_ID}" \
        "${CURL_HEADERS[@]}")
    FB_STATE=$(json_field "$FB_PROJECT" '.state // empty')
    if [[ "$FB_STATE" == "ACTIVE" ]]; then
        echo "✓ Firebase project is active"
        break
    fi
    echo "  Still provisioning... ($((i * 5))s)"
    if [[ "$i" == "12" ]]; then
        die "Timed out waiting for Firebase project to become active"
    fi
    sleep 5
done

resolve_or_create_app() {
    local apps_response matches match_count operation_name done_response

    apps_response=$(curl -s \
        "https://firebase.googleapis.com/v1beta1/projects/${PROJECT_ID}/webApps" \
        "${CURL_HEADERS[@]}")

    if [[ -n "$APP_ID" ]]; then
        if ! echo "$apps_response" | jq -e --arg app_id "$APP_ID" '.apps[]? | select(.appId == $app_id)' >/dev/null 2>&1; then
            die "Firebase Web App '$APP_ID' was not found in project '$PROJECT_ID'"
        fi
        echo "✓ Reusing explicitly selected Firebase Web App: $APP_ID"
        return
    fi

    matches=$(echo "$apps_response" | jq -r --arg name "$APP_DISPLAY_NAME" '.apps[]? | select(.displayName == $name) | .appId')
    match_count=$(echo "$matches" | sed '/^$/d' | wc -l)

    if [[ "$match_count" -gt 1 ]]; then
        die "Multiple Firebase Web Apps named '$APP_DISPLAY_NAME' exist. Use --app-id to select one explicitly."
    fi

    if [[ "$match_count" -eq 1 ]]; then
        APP_ID=$(echo "$matches" | sed '/^$/d' | head -1)
        echo "✓ Reusing dedicated Plain Flags Firebase Web App: $APP_ID"
        return
    fi

    echo "Creating dedicated Firebase Web App '$APP_DISPLAY_NAME'..."
    CREATE_RESPONSE=$(curl -s -X POST \
        "https://firebase.googleapis.com/v1beta1/projects/${PROJECT_ID}/webApps" \
        "${CURL_HEADERS[@]}" \
        -d "{\"displayName\":\"${APP_DISPLAY_NAME}\"}")

    operation_name=$(json_field "$CREATE_RESPONSE" '.name // empty')
    [[ -n "$operation_name" ]] || die "Failed to create Firebase Web App"

    for i in $(seq 1 12); do
        sleep 5
        done_response=$(curl -s \
            "https://firebase.googleapis.com/v1beta1/${operation_name}" \
            "${CURL_HEADERS[@]}")
        if [[ "$(json_field "$done_response" '.done // false')" == "true" ]]; then
            APP_ID=$(json_field "$done_response" '.response.appId // empty')
            break
        fi
        echo "  Waiting for web app creation... ($((i * 5))s)"
    done

    [[ -n "$APP_ID" ]] || die "Timed out waiting for Firebase Web App creation"
    echo "✓ Created dedicated Plain Flags Firebase Web App: $APP_ID"
}

resolve_or_create_app

echo "Retrieving Firebase Web App config..."
CONFIG=$(curl -s \
    "https://firebase.googleapis.com/v1beta1/projects/${PROJECT_ID}/webApps/${APP_ID}/config" \
    "${CURL_HEADERS[@]}")

FIREBASE_API_KEY=$(json_field "$CONFIG" '.apiKey // empty')
FIREBASE_AUTH_DOMAIN=$(json_field "$CONFIG" '.authDomain // empty')
FIREBASE_APP_ID=$(json_field "$CONFIG" '.appId // empty')
FIREBASE_PROJECT_ID=$(json_field "$CONFIG" '.projectId // empty')

[[ -n "$FIREBASE_API_KEY" ]] || die "Could not retrieve firebase_api_key from Firebase Web App config"
[[ -n "$FIREBASE_AUTH_DOMAIN" ]] || die "Could not retrieve firebase_auth_domain from Firebase Web App config"
[[ -n "$FIREBASE_APP_ID" ]] || die "Could not retrieve firebase_app_id from Firebase Web App config"
[[ -n "$FIREBASE_PROJECT_ID" ]] || FIREBASE_PROJECT_ID="$PROJECT_ID"

echo "✓ Retrieved Firebase Web App config"

cat > "$OUTPUT_FILE" <<EOF
project_id           = "${PROJECT_ID}"
region               = "${REGION}"
firebase_project_id  = "${FIREBASE_PROJECT_ID}"
firebase_auth_domain = "${FIREBASE_AUTH_DOMAIN}"
firebase_api_key     = "${FIREBASE_API_KEY}"
firebase_app_id      = "${FIREBASE_APP_ID}"
EOF

chmod 600 "$OUTPUT_FILE"

echo ""
echo "Terraform values"
echo "----------------"
cat "$OUTPUT_FILE"
echo ""
echo "Generated file: $OUTPUT_FILE"
echo ""
echo "Notes:"
echo "- Default behavior creates or reuses a dedicated Plain Flags Firebase Web App."
echo "- Reuse of an existing app is supported only via --app-id to avoid accidental user sharing."
echo ""
echo "┌─────────────────────────────────────────────────────────────────┐"
echo "│  Next step: initialise Firebase Authentication (manual)         │"
echo "└─────────────────────────────────────────────────────────────────┘"
echo ""
echo "  Firebase Authentication cannot be initialised programmatically."
echo "  You must enable it once through the Firebase Console:"
echo ""
echo "  1. Open this URL in your browser:"
echo "     https://console.firebase.google.com/project/${PROJECT_ID}/authentication/providers"
echo ""
echo "  2. Click 'Get started'."
echo ""
echo "  3. Then run:"
echo "     ./setup-firebase-auth.sh --project ${PROJECT_ID}"
echo ""
