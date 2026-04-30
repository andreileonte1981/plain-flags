#!/bin/bash
# Plain Flags GCP States Service — Stress Test Runner
#
# Reads all configuration directly from the infrastructure folder:
#   ../infrastructure/config/instance-config  → PROJECT_ID, REGION
#   ../infrastructure/.db-connection-name     → CLOUD_SQL_CONNECTION_NAME
#   ../infrastructure/.secrets/password.pg.txt → DB_PASSWORD
#   ../infrastructure/.secrets/apikey.states.txt → STATES_APIKEY
#   ../infrastructure/.secrets/firebase.env   → FIREBASE_API_KEY, TEST_USER_*
#
# What this script does:
#   1. Derives all configuration from the infrastructure folder
#   2. Resolves the management service URL via gcloud
#   3. Opens Cloud Logging for the states function in a browser
#   4. Clears ALL data from flags, constraints, history tables  ← DESTRUCTIVE
#   5. Seeds 100 flags with 2 constraints via the management API, all turned on
#   6. Runs the concurrent stress test with configurable concurrency
#   7. Opens the report in a browser
#   8. Clears the stress test data again
#
# Usage:
#   ./stress.sh [concurrency]
#
# Examples:
#   ./stress.sh          # uses default concurrency (200)
#   ./stress.sh 500      # overrides concurrency

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$SCRIPT_DIR/../infrastructure"
cd "$SCRIPT_DIR"

# ── Read infrastructure configuration ────────────────────────────────────────

if [ ! -f "$INFRA_DIR/config/instance-config" ]; then
    echo "Error: $INFRA_DIR/config/instance-config not found"
    echo "Run setup-project.sh in the infrastructure folder first."
    exit 1
fi
source "$INFRA_DIR/config/instance-config"

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "your-gcp-project-id-here" ]; then
    echo "Error: PROJECT_ID not set in config/instance-config"
    exit 1
fi

CONNECTION_NAME=$(cat "$INFRA_DIR/.db-connection-name" 2>/dev/null || true)
if [ -z "$CONNECTION_NAME" ]; then
    echo "Error: $INFRA_DIR/.db-connection-name not found or empty"
    exit 1
fi

DB_PASSWORD=$(cat "$INFRA_DIR/.secrets/password.pg.txt" 2>/dev/null | tr -d '[:space:]' || true)
if [ -z "$DB_PASSWORD" ]; then
    echo "Error: $INFRA_DIR/.secrets/password.pg.txt not found or empty"
    exit 1
fi

STATES_APIKEY=$(cat "$INFRA_DIR/.secrets/apikey.states.txt" 2>/dev/null | tr -d '[:space:]' || true)
if [ -z "$STATES_APIKEY" ]; then
    echo "Error: $INFRA_DIR/.secrets/apikey.states.txt not found or empty"
    exit 1
fi

if [ ! -f "$INFRA_DIR/.secrets/firebase.env" ]; then
    echo "Error: $INFRA_DIR/.secrets/firebase.env not found"
    echo "Run setup-firebase-app.sh and setup-firebase-auth.sh in the infrastructure folder first."
    exit 1
fi
source "$INFRA_DIR/.secrets/firebase.env"

# Resolve the management service URL via gcloud
MANAGEMENT_SERVICE_URL=$(gcloud run services describe plainflags-management \
    --region="$REGION" --project="$PROJECT_ID" \
    --format="value(status.url)" 2>/dev/null || true)
if [ -z "$MANAGEMENT_SERVICE_URL" ]; then
    echo "Error: Could not resolve management service URL."
    echo "Make sure the management service is deployed and you are signed in to gcloud."
    exit 1
fi

STATES_VARIANT="${STATES_VARIANT:-function}"
if [[ "$STATES_VARIANT" == "service" ]]; then
    STATES_SERVICE_URL=$(gcloud run services describe plainflags-states \
        --region="$REGION" --project="$PROJECT_ID" \
        --format="value(status.url)" 2>/dev/null || true)
    if [ -z "$STATES_SERVICE_URL" ]; then
        echo "Error: Could not resolve states Cloud Run service URL."
        echo "Make sure the service is deployed: ./deploy-flag-states.sh"
        exit 1
    fi
else
    STATES_SERVICE_URL="https://${REGION}-${PROJECT_ID}.cloudfunctions.net/plainflags-states"
fi
CONCURRENCY=${1:-200}

# ── Export env for Node processes ─────────────────────────────────────────────

export CLOUD_SQL_CONNECTION_NAME="$CONNECTION_NAME"
export DB_NAME="plainflags"
export DB_USER="plainflags"
export DB_PASSWORD
export MANAGEMENT_SERVICE_URL
export FIREBASE_API_KEY
export TEST_USER_EMAIL
export TEST_USER_PASSWORD
export STATES_SERVICE_URL
export STATES_APIKEY
export STRESS_CONCURRENCY="$CONCURRENCY"

# ── Warnings ──────────────────────────────────────────────────────────────────

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║              PLAIN FLAGS GCP STRESS TEST                         ║"
echo "╠══════════════════════════════════════════════════════════════════╣"
echo "║  WARNING: This will DELETE PLAIN FLAGS DATA from the cloud       ║"
echo "║  database (flags, constraints, history)                          ║"
echo "║                                                                  ║"
echo "║  Do NOT run this against production feature flag data.           ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "  Project         : $PROJECT_ID"
echo "  Region          : $REGION"
echo "  DB instance     : $CONNECTION_NAME"
echo "  Management URL  : $MANAGEMENT_SERVICE_URL"
echo "  States URL      : $STATES_SERVICE_URL"
echo "  Concurrency     : $CONCURRENCY concurrent SDK requests"
echo ""
read -r -p "Type YES to continue: " confirmation

if [ "$confirmation" != "YES" ]; then
    echo "Cancelled."
    exit 0
fi

# ── Open logs for states service ──────────────────────────────────────────────────────

if [[ "${STATES_VARIANT:-function}" == "service" ]]; then
    LOGS_URL="https://console.cloud.google.com/run/detail/${REGION}/plainflags-states/observability/logs?project=${PROJECT_ID}&supportedpurview=project"
    echo ""
    echo "Opening Cloud Run logs for states service..."
else
    LOGS_URL="https://console.cloud.google.com/functions/details/${REGION}/plainflags-states?project=${PROJECT_ID}&tab=logs"
    echo ""
    echo "Opening Cloud Functions logs for states function..."
fi
if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$LOGS_URL" >/dev/null 2>&1 &
elif command -v open >/dev/null 2>&1; then
    open "$LOGS_URL" >/dev/null 2>&1 &
else
    echo "  (browser not available — open manually: $LOGS_URL)"
fi

# ── Install dependencies (if needed) ─────────────────────────────────────────

if [ ! -d "node_modules" ]; then
    echo ""
    echo "Installing dependencies..."
    npm install
fi

# ── Compile ───────────────────────────────────────────────────────────────────

npm run compile

# ── Step 1: Clear data ────────────────────────────────────────────────────────

echo ""
echo "Step 1/4: Clearing existing data..."
node dist/clear-data.js

# ── Step 2: Seed data ─────────────────────────────────────────────────────────

echo ""
echo "Step 2/4: Seeding stress test data (100 flags, 2 constraints)..."
node dist/seed-data.js

echo ""
echo "Giving the states service 2 seconds to pick up fresh data..."
sleep 2

# ── Step 3: Run stress test ───────────────────────────────────────────────────

echo ""
echo "Step 3/4: Running stress test with concurrency=$CONCURRENCY..."

REPORT_PATH=""
set +e
OUTPUT=$(node dist/stress-test.js "$CONCURRENCY" 2>&1)
EXIT_CODE=$?
set -e

echo "$OUTPUT"

if [ $EXIT_CODE -ne 0 ]; then
    echo "Stress test process exited with error code $EXIT_CODE"
fi

REPORT_PATH=$(echo "$OUTPUT" | grep '__REPORT_PATH__:' | sed 's/__REPORT_PATH__://')

# ── Step 4: Clear data again ──────────────────────────────────────────────────

echo ""
echo "Step 4/4: Clearing stress test data..."
node dist/clear-data.js

# ── Open report ───────────────────────────────────────────────────────────────

if [ -n "$REPORT_PATH" ] && [ -f "$REPORT_PATH" ]; then
    echo ""
    echo "Opening report: $REPORT_PATH"
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$REPORT_PATH" >/dev/null 2>&1 &
    elif command -v open >/dev/null 2>&1; then
        open "$REPORT_PATH" >/dev/null 2>&1 &
    else
        echo "  (browser not available — open manually: $REPORT_PATH)"
    fi
else
    echo ""
    echo "Report file not found; check output above."
fi

echo ""
echo "Stress test complete."

