#!/bin/bash
# Configure Firebase Authentication policy for Plain Flags.
#
# This script (step 2 of 2):
#   - Configures Firebase Auth for email/password sign-in
#   - Disables end-user self-signup
#   - Allows end-user self-deletion
#
# Prerequisite: Firebase Authentication must already be initialised in the
# Firebase Console. Visit the URL below and click "Get started" before running
# this script:
#   https://console.firebase.google.com/project/<PROJECT_ID>/authentication/providers

set -euo pipefail

PROJECT_ID=""

usage() {
    cat <<EOF
Usage: $(basename "$0") --project <gcp-project-id>

Options:
  --project <id>  GCP project id whose Firebase Auth policy to configure
  --help          Show this help text

Prerequisite:
  Firebase Authentication must be initialised in the Firebase Console before
  running this script. If you have not done so yet:
    1. Visit https://console.firebase.google.com/project/<id>/authentication/providers
    2. Click "Get started"
    3. Then re-run this script.
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

parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --project)
                [[ $# -ge 2 ]] || die "--project requires a value"
                PROJECT_ID="$2"
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

echo "Configuring Firebase Auth policy for project: $PROJECT_ID"
echo ""

AUTH_CONFIGURED=false
for i in $(seq 1 12); do
    SIGNIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH \
        "https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT_ID}/config?updateMask=signIn.email.enabled,signIn.email.passwordRequired,client.permissions.disabledUserSignup,client.permissions.disabledUserDeletion" \
        "${CURL_HEADERS[@]}" \
        -d '{"signIn":{"email":{"enabled":true,"passwordRequired":true}},"client":{"permissions":{"disabledUserSignup":true,"disabledUserDeletion":false}}}')
    HTTP_CODE=$(echo "$SIGNIN_RESPONSE" | tail -1)
    BODY=$(echo "$SIGNIN_RESPONSE" | head -n -1)

    if [[ "$HTTP_CODE" == "200" ]]; then
        echo "✓ Email/password auth enabled"
        echo "✓ End-user self-signup disabled"
        echo "✓ End-user self-deletion allowed"
        AUTH_CONFIGURED=true
        break
    fi

    if [[ "$HTTP_CODE" == "404" ]]; then
        echo "  Auth config not ready yet, retrying... ($((i * 5))s)"
        sleep 5
        continue
    fi

    echo "Error: could not update Firebase Auth policy (HTTP $HTTP_CODE)"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    die "Firebase Auth configuration failed"
done

if [[ "$AUTH_CONFIGURED" != "true" ]]; then
    echo ""
    echo "Error: Firebase Auth configuration timed out after retries."
    echo ""
    echo "Firebase Authentication may not be initialised yet. Please:"
    echo "  1. Visit https://console.firebase.google.com/project/${PROJECT_ID}/authentication/providers"
    echo "  2. Click 'Get started'"
    echo "  3. Re-run this script."
    exit 1
fi

echo ""
echo "Firebase Authentication is configured. You can now run Terraform."
