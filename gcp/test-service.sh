#!/bin/bash
# Simple test script for the deployed flag-management service

set -e

SERVICE_URL=${1:-}

if [ -z "$SERVICE_URL" ]; then
    echo "Usage: $0 <service-url>"
    echo "Example: $0 https://plainflags-management-xyz.run.app"
    exit 1
fi

echo "Testing Plain Flags management service at: $SERVICE_URL"
echo ""

# Test 1: Health check
echo "1. Testing health check..."
health_response=$(curl -s "$SERVICE_URL/health")
if echo "$health_response" | grep -q "ok"; then
    echo "✓ Health check passed"
else
    echo "✗ Health check failed: $health_response"
    exit 1
fi
echo ""

# Test 2: Create a flag
echo "2. Creating a test flag..."
create_response=$(curl -s -w "%{http_code}" -o /tmp/create_response.json -X POST "$SERVICE_URL/api/flags" \
    -H 'Content-Type: application/json' \
    -d '{"name":"test-flag-'$(date +%s)'"}')

if [ "$create_response" = "201" ]; then
    echo "✓ Flag created successfully"
    cat /tmp/create_response.json | jq '.' 2>/dev/null || cat /tmp/create_response.json
else
    echo "✗ Flag creation failed with status: $create_response"
    cat /tmp/create_response.json
    exit 1
fi
echo ""

# Test 3: List flags
echo "3. Listing all flags..."
list_response=$(curl -s -w "%{http_code}" -o /tmp/list_response.json "$SERVICE_URL/api/flags")

if [ "$list_response" = "200" ]; then
    echo "✓ Flag list retrieved successfully"
    cat /tmp/list_response.json | jq '.' 2>/dev/null || cat /tmp/list_response.json
else
    echo "✗ Flag listing failed with status: $list_response"
    cat /tmp/list_response.json
    exit 1
fi
echo ""

# Test 4: Try to create duplicate flag (should fail)
echo "4. Testing duplicate flag creation (should fail)..."
duplicate_response=$(curl -s -w "%{http_code}" -o /tmp/duplicate_response.json -X POST "$SERVICE_URL/api/flags" \
    -H 'Content-Type: application/json' \
    -d '{"name":"test-flag-duplicate"}')

# Create first one
if [ "$duplicate_response" = "201" ]; then
    # Try to create the same flag again
    duplicate_response2=$(curl -s -w "%{http_code}" -o /tmp/duplicate_response2.json -X POST "$SERVICE_URL/api/flags" \
        -H 'Content-Type: application/json' \
        -d '{"name":"test-flag-duplicate"}')
    
    if [ "$duplicate_response2" = "409" ]; then
        echo "✓ Duplicate flag correctly rejected"
    else
        echo "✗ Duplicate flag was not rejected (status: $duplicate_response2)"
        cat /tmp/duplicate_response2.json
        exit 1
    fi
else
    echo "✗ Initial flag creation failed for duplicate test"
    exit 1
fi

echo ""
echo "🎉 All tests passed! Your Plain Flags service is working correctly."

# Cleanup temp files
rm -f /tmp/create_response.json /tmp/list_response.json /tmp/duplicate_response.json /tmp/duplicate_response2.json