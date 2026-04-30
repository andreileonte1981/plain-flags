#!/bin/bash
# Configure Firebase Authentication for the Plain Flags project.
#
# This is step 2 of 2:
#   - Enables Email/Password sign-in
#   - Disables end-user self sign-up
#   - Allows end-user self-deletion
#   - Creates (or updates) the cloud test runner user
#   - Updates .secrets/firebase.env with test user credentials

set -e

if [ ! -f "config/instance-config" ]; then
    echo "Error: config/instance-config not found"
    echo "Run this script from the gcp/infrastructure directory."
    exit 1
fi

source ./config/instance-config

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "your-project-id-here" ]; then
    echo "Error: PROJECT_ID not set in config/instance-config"
    exit 1
fi

SECRETS_DIR=".secrets"
SECRETS_FILE="$SECRETS_DIR/firebase.env"

if [ ! -f "$SECRETS_FILE" ]; then
    echo "Error: $SECRETS_FILE not found"
    echo "Run ./setup-firebase-app.sh first."
    exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
    echo "Error: 'jq' is required but not installed."
    echo "Install it with:  sudo apt-get install jq  (Debian/Ubuntu)"
    echo "                  brew install jq            (macOS)"
    exit 1
fi

if ! command -v openssl >/dev/null 2>&1; then
    echo "Error: 'openssl' is required but not installed."
    exit 1
fi

source "$SECRETS_FILE"

if [ -z "$FIREBASE_API_KEY" ]; then
    echo "Error: FIREBASE_API_KEY is missing from $SECRETS_FILE"
    echo "Run ./setup-firebase-app.sh first."
    exit 1
fi

echo "Configuring Firebase auth for GCP project: $PROJECT_ID"

ACCESS_TOKEN=$(gcloud auth print-access-token)

CURL_HEADERS=(
    -H "Authorization: Bearer $ACCESS_TOKEN"
    -H "x-goog-user-project: ${PROJECT_ID}"
    -H "Content-Type: application/json"
)

echo "Configuring Email/Password auth policy..."
SIGNIN_ENABLED=false
LAST_HTTP_CODE=""
for i in $(seq 1 12); do
    SIGNIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH \
        "https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT_ID}/config?updateMask=signIn.email.enabled,signIn.email.passwordRequired,client.permissions.disabledUserSignup,client.permissions.disabledUserDeletion" \
        "${CURL_HEADERS[@]}" \
        -d '{"signIn":{"email":{"enabled":true,"passwordRequired":true}},"client":{"permissions":{"disabledUserSignup":true,"disabledUserDeletion":false}}}')
    HTTP_CODE=$(echo "$SIGNIN_RESPONSE" | tail -1)
    LAST_HTTP_CODE="$HTTP_CODE"
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✓ Email/Password enabled, end-user sign-up disabled, self-deletion allowed"
        SIGNIN_ENABLED=true
        break
    fi

    if [ "$HTTP_CODE" = "404" ]; then
        echo "  Auth config not ready yet, retrying... ($((i*5))s)"
        sleep 5
        continue
    fi

    echo "Error: Could not update auth policy (HTTP $HTTP_CODE)"
    echo "$SIGNIN_RESPONSE" | head -n -1 | jq . 2>/dev/null || true
    echo ""
    echo "Make sure Firebase Authentication is initialised in the console first:"
    echo "  https://console.firebase.google.com/project/${PROJECT_ID}/authentication/providers"
    exit 1
done

if [ "$SIGNIN_ENABLED" = "false" ]; then
    if [ "$LAST_HTTP_CODE" = "404" ]; then
        echo "Error: Auth config not ready after 60s."
        echo "Firebase Authentication may not be initialised yet."
        echo "Open the console and click 'Get started':"
        echo "  https://console.firebase.google.com/project/${PROJECT_ID}/authentication/providers"
    else
        echo "Error: Could not enable Firebase auth policy"
    fi
    exit 1
fi

echo "Configuring cloud test runner user..."
TEST_USER_EMAIL="test-runner@${PROJECT_ID}.cloud.test"
TEST_USER_PASSWORD="${TEST_USER_PASSWORD:-}"

if [ -n "$TEST_USER_PASSWORD" ]; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"${TEST_USER_EMAIL}\",\"password\":\"${TEST_USER_PASSWORD}\",\"returnSecureToken\":true}")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✓ Test runner user credentials are valid"
    else
        TEST_USER_PASSWORD=""
    fi
fi

if [ -z "$TEST_USER_PASSWORD" ]; then
    TEST_USER_PASSWORD=$(openssl rand -base64 18 | tr -d '/+=')

    LOOKUP=$(curl -s -X POST \
        "https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:lookup" \
        "${CURL_HEADERS[@]}" \
        -d "{\"email\":[\"${TEST_USER_EMAIL}\"]}")
    EXISTING_UID=$(echo "$LOOKUP" | jq -r '.users[0].localId // empty')

    if [ -n "$EXISTING_UID" ]; then
        curl -s -X POST \
            "https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:update" \
            "${CURL_HEADERS[@]}" \
            -d "{\"localId\":\"${EXISTING_UID}\",\"password\":\"${TEST_USER_PASSWORD}\"}" > /dev/null
        echo "✓ Test runner user password reset"
    else
        SIGNUP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
            "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}" \
            "${CURL_HEADERS[@]}" \
            -d "{\"email\":\"${TEST_USER_EMAIL}\",\"password\":\"${TEST_USER_PASSWORD}\",\"targetProjectId\":\"${PROJECT_ID}\",\"returnSecureToken\":true}")
        if [ "$SIGNUP_CODE" != "200" ]; then
            echo "Warning: Could not create test runner user (HTTP $SIGNUP_CODE). Cloud tests may not work."
            TEST_USER_EMAIL=""
            TEST_USER_PASSWORD=""
        else
            echo "✓ Test runner user created: $TEST_USER_EMAIL"
        fi
    fi
fi

cat > "$SECRETS_FILE" <<EOF
# Firebase credentials - generated by setup-firebase-auth.sh
# DO NOT commit this file to version control
FIREBASE_API_KEY=${FIREBASE_API_KEY}
FIREBASE_APP_ID=${FIREBASE_APP_ID}
FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN}
FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET}
FIREBASE_MESSAGING_SENDER_ID=${FIREBASE_MESSAGING_SENDER_ID}
TEST_USER_EMAIL=${TEST_USER_EMAIL}
TEST_USER_PASSWORD=${TEST_USER_PASSWORD}
EOF

chmod 600 "$SECRETS_FILE"

echo ""
echo "✓ Firebase auth setup complete"
echo "✓ Updated $SECRETS_FILE"
echo ""
