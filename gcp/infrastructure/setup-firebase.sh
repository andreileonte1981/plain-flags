#!/bin/bash
# Set up Firebase for the Plain Flags project:
#   - Adds Firebase to the GCP project (idempotent)
#   - Creates (or reuses) a Web App named "Plain Flags Dashboard"
#   - Enables Email/Password sign-in, disables end-user self sign-up, allows self-deletion
#   - Writes API key, App ID and other config to .secrets/firebase.env

set -e

# ── Prerequisites ────────────────────────────────────────────────────────────

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

if ! command -v jq >/dev/null 2>&1; then
    echo "Error: 'jq' is required but not installed."
    echo "Install it with:  sudo apt-get install jq  (Debian/Ubuntu)"
    echo "                  brew install jq            (macOS)"
    exit 1
fi

echo "Setting up Firebase for GCP project: $PROJECT_ID"

ACCESS_TOKEN=$(gcloud auth print-access-token)
SECRETS_DIR=".secrets"
SECRETS_FILE="$SECRETS_DIR/firebase.env"

# Common curl headers — quota project is required when using user (ADC) credentials
CURL_HEADERS=(
    -H "Authorization: Bearer $ACCESS_TOKEN"
    -H "x-goog-user-project: ${PROJECT_ID}"
    -H "Content-Type: application/json"
)

mkdir -p "$SECRETS_DIR"

# ── 1. Add Firebase to the GCP project (idempotent) ─────────────────────────

echo "Adding Firebase to project (safe to run multiple times)..."
ADD_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    "https://firebase.googleapis.com/v1beta1/projects/${PROJECT_ID}:addFirebase" \
    "${CURL_HEADERS[@]}" \
    -d '{}')

HTTP_CODE=$(echo "$ADD_RESPONSE" | tail -1)
BODY=$(echo "$ADD_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Firebase added to project"
elif echo "$BODY" | jq -e '.error.status == "ALREADY_EXISTS"' >/dev/null 2>&1; then
    echo "✓ Firebase already enabled on project"
else
    echo "Warning: Unexpected response when adding Firebase (HTTP $HTTP_CODE):"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    echo "Continuing..."
fi

# Wait for Firebase project to be fully provisioned before proceeding
echo "Waiting for Firebase project to be ready..."
for i in $(seq 1 12); do
    FB_PROJECT=$(curl -s \
        "https://firebase.googleapis.com/v1beta1/projects/${PROJECT_ID}" \
        "${CURL_HEADERS[@]}")
    FB_STATE=$(echo "$FB_PROJECT" | jq -r '.state // empty')
    if [ "$FB_STATE" = "ACTIVE" ]; then
        echo "✓ Firebase project is active"
        break
    fi
    echo "  Still provisioning... ($((i*5))s)"
    sleep 5
    if [ "$i" = "12" ]; then
        echo "Error: Timed out waiting for Firebase project to become active"
        exit 1
    fi
done

# ── 2. Find or create the Web App ────────────────────────────────────────────

echo "Looking for existing web app..."
APPS_RESPONSE=$(curl -s \
    "https://firebase.googleapis.com/v1beta1/projects/${PROJECT_ID}/webApps" \
    "${CURL_HEADERS[@]}")

APP_ID=$(echo "$APPS_RESPONSE" | jq -r '
    .apps[]?
    | select(.displayName == "Plain Flags Dashboard")
    | .appId' | head -1)

if [ -n "$APP_ID" ]; then
    echo "✓ Found existing web app: $APP_ID"
else
    echo "Creating web app 'Plain Flags Dashboard'..."
    CREATE_RESPONSE=$(curl -s -X POST \
        "https://firebase.googleapis.com/v1beta1/projects/${PROJECT_ID}/webApps" \
        "${CURL_HEADERS[@]}" \
        -d '{"displayName":"Plain Flags Dashboard"}')

    # The create call returns an Operation; poll until done
    OPERATION_NAME=$(echo "$CREATE_RESPONSE" | jq -r '.name // empty')
    if [ -z "$OPERATION_NAME" ]; then
        echo "Error: Failed to create web app"
        echo "$CREATE_RESPONSE" | jq . 2>/dev/null || echo "$CREATE_RESPONSE"
        exit 1
    fi

    echo "Waiting for web app creation to complete..."
    for i in $(seq 1 12); do
        sleep 5
        OP_RESPONSE=$(curl -s \
            "https://firebase.googleapis.com/v1beta1/${OPERATION_NAME}" \
            "${CURL_HEADERS[@]}")
        DONE=$(echo "$OP_RESPONSE" | jq -r '.done // false')
        if [ "$DONE" = "true" ]; then
            APP_ID=$(echo "$OP_RESPONSE" | jq -r '.response.appId // empty')
            break
        fi
        echo "  Still waiting... ($((i*5))s)"
    done

    if [ -z "$APP_ID" ]; then
        echo "Error: Timed out waiting for web app creation"
        exit 1
    fi
    echo "✓ Web app created: $APP_ID"
fi

# ── 3. Retrieve the SDK config ───────────────────────────────────────────────

echo "Retrieving Firebase SDK config..."
CONFIG=$(curl -s \
    "https://firebase.googleapis.com/v1beta1/projects/${PROJECT_ID}/webApps/${APP_ID}/config" \
    "${CURL_HEADERS[@]}")

API_KEY=$(echo "$CONFIG" | jq -r '.apiKey // empty')
AUTH_DOMAIN=$(echo "$CONFIG" | jq -r '.authDomain // empty')
STORAGE_BUCKET=$(echo "$CONFIG" | jq -r '.storageBucket // empty')
MESSAGING_SENDER_ID=$(echo "$CONFIG" | jq -r '.messagingSenderId // empty')

if [ -z "$API_KEY" ]; then
    echo "Error: Could not retrieve API key from SDK config"
    echo "$CONFIG" | jq . 2>/dev/null || echo "$CONFIG"
    exit 1
fi

echo "✓ Retrieved SDK config"

# ── 4. Configure Email/Password auth policy ─────────────────────────────────

echo "Configuring Email/Password auth policy..."

# The auth config endpoint may return 404 briefly while Firebase Auth initialises.
# Retry up to 60 seconds.
SIGNIN_ENABLED=false
for i in $(seq 1 12); do
    SIGNIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH \
        "https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT_ID}/config?updateMask=signIn.email.enabled,signIn.email.passwordRequired,client.permissions.disabledUserSignup,client.permissions.disabledUserDeletion" \
        "${CURL_HEADERS[@]}" \
        -d '{"signIn":{"email":{"enabled":true,"passwordRequired":true}},"client":{"permissions":{"disabledUserSignup":true,"disabledUserDeletion":false}}}')
    HTTP_CODE=$(echo "$SIGNIN_RESPONSE" | tail -1)
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✓ Email/Password enabled, end-user sign-up disabled, self-deletion allowed"
        SIGNIN_ENABLED=true
        break
    elif [ "$HTTP_CODE" = "404" ]; then
        echo "  Auth config not ready yet, retrying... ($((i*5))s)"
        sleep 5
    else
        echo "Warning: Could not update auth policy (HTTP $HTTP_CODE)"
        echo "$SIGNIN_RESPONSE" | head -n -1 | jq . 2>/dev/null || true
        echo "You may need to configure it manually in the Firebase Console:"
        echo "  https://console.firebase.google.com/project/${PROJECT_ID}/authentication/providers"
        break
    fi
done

if [ "$SIGNIN_ENABLED" = "false" ] && [ "$HTTP_CODE" = "404" ]; then
    echo "Warning: Auth config not ready after 60s. Configure Email/Password and signup policy manually:"
    echo "  https://console.firebase.google.com/project/${PROJECT_ID}/authentication/providers"
fi

# ── 5. Create or verify test runner user ────────────────────────────────────

TEST_USER_EMAIL="test-runner@${PROJECT_ID}.cloud.test"
TEST_USER_PASSWORD=""

# Re-use stored credentials if they still work
if [ -f "$SECRETS_FILE" ]; then
    STORED_PASSWORD=$(grep '^TEST_USER_PASSWORD=' "$SECRETS_FILE" 2>/dev/null | cut -d= -f2 || true)
    if [ -n "$STORED_PASSWORD" ]; then
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
            "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}" \
            -H "Content-Type: application/json" \
            -d "{\"email\":\"${TEST_USER_EMAIL}\",\"password\":\"${STORED_PASSWORD}\",\"returnSecureToken\":true}")
        if [ "$HTTP_CODE" = "200" ]; then
            echo "✓ Test runner user credentials are valid"
            TEST_USER_PASSWORD="$STORED_PASSWORD"
        fi
    fi
fi

if [ -z "$TEST_USER_PASSWORD" ]; then
    TEST_USER_PASSWORD=$(openssl rand -base64 18 | tr -d '/+=')

    # Look up existing user by email to get UID (for password reset)
    LOOKUP=$(curl -s -X POST \
        "https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:lookup" \
        "${CURL_HEADERS[@]}" \
        -d "{\"email\":[\"${TEST_USER_EMAIL}\"]}")
    EXISTING_UID=$(echo "$LOOKUP" | jq -r '.users[0].localId // empty')

    if [ -n "$EXISTING_UID" ]; then
        # Reset password for existing user via admin
        curl -s -X POST \
            "https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:update" \
            "${CURL_HEADERS[@]}" \
            -d "{\"localId\":\"${EXISTING_UID}\",\"password\":\"${TEST_USER_PASSWORD}\"}" > /dev/null
        echo "✓ Test runner user password reset"
    else
        # Create new user via admin request (works even when end-user signup is disabled)
        SIGNUP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
            "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}" \
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

# ── 6. Write .secrets/firebase.env ──────────────────────────────────────────

cat > "$SECRETS_FILE" <<EOF
# Firebase credentials - generated by setup-firebase.sh
# DO NOT commit this file to version control
FIREBASE_API_KEY=${API_KEY}
FIREBASE_APP_ID=${APP_ID}
FIREBASE_AUTH_DOMAIN=${AUTH_DOMAIN}
FIREBASE_PROJECT_ID=${PROJECT_ID}
FIREBASE_STORAGE_BUCKET=${STORAGE_BUCKET}
FIREBASE_MESSAGING_SENDER_ID=${MESSAGING_SENDER_ID}
TEST_USER_EMAIL=${TEST_USER_EMAIL}
TEST_USER_PASSWORD=${TEST_USER_PASSWORD}
EOF

chmod 600 "$SECRETS_FILE"

echo ""
echo "✓ Firebase secrets written to $SECRETS_FILE"
echo ""
echo "Setup complete!"
echo "  API Key:     $API_KEY"
echo "  App ID:      $APP_ID"
echo "  Auth Domain: $AUTH_DOMAIN"
echo ""
