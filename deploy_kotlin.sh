#!/bin/bash
set -e

cd sdk/kotlin

VERSION=$(sed -n 's/^version = "\(.*\)"/\1/p' build.gradle.kts | head -1)

if [ -z "$VERSION" ]; then
  echo "Could not read version from sdk/kotlin/build.gradle.kts"
  exit 1
fi

echo "Deploying version $VERSION of Kotlin SDK"

# ./gradlew publishToMavenLocal --no-configuration-cache
./gradlew publishToMavenCentral --no-configuration-cache

cd ../..

git tag -a sdk/kotlin/v$VERSION -m "v$VERSION $1"

git push origin sdk/kotlin/v$VERSION
