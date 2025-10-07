#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 <version> <release_notes>"
  exit 1
fi

echo "Deploying version $1 of Go SDK"

git tag -a sdk/go/v$1 -m "v$1 $2"

git push origin sdk/go/v$1