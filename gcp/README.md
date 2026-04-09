# Plain Flags GCP Deployment

Complete Google Cloud Platform deployment for Plain Flags with Cloud SQL PostgreSQL, Cloud Run services, React dashboard, and automated testing.

## Prerequisites

- Google Cloud SDK installed and authenticated
- A GCP project with billing enabled
- Required permissions: Cloud SQL Admin, Cloud Run Admin, Service Account Admin
- Node.js 20+ (for local development)

## Complete Deployment

> **⚠️ IMPORTANT**: Before deployment, you must configure `config/instance-config` with all the variable values, and the following secrets in gcp/infrastructure/.secrets

- apikey.states.txt > the value of your API key - your controlled software initializes the SDK library with this value.
- password.pg.txt > the database password for Plain Flags data PostgreSQL instance
- dashboard.passkey.txt > the passkey used by dashboard clients to authenticate against the `/api/dashauth` endpoint

All the scripts below run from the gcp/infrastructure directory

```bash
cd infrastructure
```

### Project setup

```bash
./setup-project.sh
```

### Raise Plain Flags for production

```bash
./up-prod.sh
```

### Raise Plain Flags for development/tests

```bash
./up-dev.sh
```

## Services Overview

### Management Service (`plainflags-management`)

Plain Flags admins and users indirectly call this service's REST API to view and change feature flag configuration and users

### States function

Provides a single API endpoint for your software to query the state of the feature flags. Deploys as a Cloud Function. Suitable for lighter traffic.

### States Run function

Same as states function, but deploys as a permanently available service with 1 instance minimum always up. Configure your choice between this and the variant above in config/instance-config

### Dashboard (`plainflags-dashboard`)

Web application for viewing and controlling feature flag configuration

### Test Service (`plainflags-cloud-test`)

Runs tests against the backend Plain Flags services and allows for viewing test results. First tests are run and displayed on deployment.

## Infrastructure Scripts

### Deployment Scripts

- `setup-project.sh` - Enable GCP APIs and set up project
- `deploy-database.sh <password>` - Deploy Cloud SQL PostgreSQL
- `deploy-flag-management.sh` - Deploy management service
- `deploy-dashboard.sh` - Deploy React dashboard
- `deploy-cloud-test.sh` - Deploy test service
  services

### Cleanup Scripts

- `cleanup.sh` - Remove all resources (includes non-billing resources)
- `down.sh` - Remove only billing resources (recommended)
- `delete-dashboard.sh` - Remove only dashboard
- `delete-cloud-test.sh` - Remove only test service

## Development Workflow

### Local Development

```bash
# Management Service
cd services/flag-management
npm install
npm run compile
npm run dev

# Dashboard
cd services/dashboard
npm install
npm run dev

# Test Service
cd services/cloud-test
npm install
npm run dev
```

### Testing

The test service provides comprehensive API testing:

```bash
# Run tests via API
curl -X POST https://YOUR_TEST_SERVICE_URL/api/run-tests

# Get test results
curl https://YOUR_TEST_SERVICE_URL/api/test-results
```

## Cost Management

To avoid ongoing charges when not actively developing:

```bash
# Delete all billing resources (recommended)
./down.sh

# Or delete everything including IAM policies
./cleanup.sh
```

**Warning**: Database deletion permanently removes ALL flag data.
