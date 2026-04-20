#!/bin/bash
set -e

if [ -z "$1" ]; then
    ARG=patch
else
    ARG=$1  # minor, major
fi

cd gcp/services

cd flag-management
npm version "$ARG"

cd ../flag-states-run
npm version "$ARG"

cd ../dashboard
npm version "$ARG"

cd ../cloud-test
npm version "$ARG"

echo "Updated GCP service versions ($ARG)."
