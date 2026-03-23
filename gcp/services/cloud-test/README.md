# Plain Flags Cloud Test Service

Cloud-deployable test service for testing the Plain Flags management API remotely.

## Overview

This service provides HTTP endpoints to run tests against a deployed Plain Flags management service and retrieve test results. It's designed to be deployed separately when you need to test your management API in the cloud.

## Features

- **HTTP API**: Run tests via REST endpoints
- **Test Reports**: Get detailed test results and logs
- **Targeted Testing**: Run specific tests by pattern matching
- **Simple Deployment**: Deploy to Cloud Run with a single script

## Current Test Coverage

- Management service health checks
- Create new flags
- List flags
- Validate flag properties
- Duplicate name handling
- Input validation

## API Endpoints

### Health Check

```
GET /health
```

Returns service status and configuration.

### Run Tests

```
POST /api/run-tests
Content-Type: application/json

{
  "pattern": "optional-test-filter"
}
```

Runs tests against the configured management service. Returns test results with unique test ID.

### Get Test Results

```
GET /api/test-results
```

Returns list of all test runs.

```
GET /api/test-results/:testId
```

Returns detailed results for a specific test run.

## Deployment

### Prerequisites

1. Management service must be deployed first
2. GCP project configured with Cloud Run API enabled

### Deploy

```bash
cd gcp/infrastructure
./deploy-cloud-test.sh
```

### Test Usage

```bash
# Run all tests
curl -X POST https://[service-url]/api/run-tests

# Run tests matching pattern
curl -X POST https://[service-url]/api/run-tests \
  -H "Content-Type: application/json" \
  -d '{"pattern": "create"}'

# Get results
curl https://[service-url]/api/test-results
```

### Cleanup

```bash
./delete-cloud-test.sh
```

## Environment Variables

- `MANAGEMENT_SERVICE_URL`: URL of the management service to test (auto-detected during deployment)
- `NODE_ENV`: Environment mode (production/development)
- `PORT`: Server port (default: 8080)
