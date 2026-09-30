#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 <version> <release_notes>"
  exit 1
fi

echo "Deploying version $1 of Kotlin SDK"

cd sdk/kotlin

sed -i "s/^version = \".*\"/version = \"$1\"/" build.gradle.kts

# Requires Sonatype Central Portal credentials and a GPG signing key configured,
# see https://vanniktech.github.io/gradle-maven-publish-plugin/central/
./gradlew publishAndReleaseToMavenCentral --no-configuration-cache

cd ../..

git tag -a sdk/kotlin/v$1 -m "v$1 $2"

git push origin sdk/kotlin/v$1
