#!/bin/bash
# Backward-compatible wrapper for the new two-step Firebase setup flow.

set -e

echo "setup-firebase.sh is now split into two scripts:"
echo "  1) ./setup-firebase-app.sh"
echo "  2) ./setup-firebase-auth.sh"
echo ""

bash "$(dirname "$0")/setup-firebase-app.sh"

echo "Next run: ./setup-firebase-auth.sh"
