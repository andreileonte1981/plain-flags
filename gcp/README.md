# Plain Flags GCP Deployment

Complete Google Cloud Platform deployment for Plain Flags with Cloud SQL PostgreSQL, Cloud Run services, React dashboard, and automated testing.

## Prerequisites

- Google Cloud SDK installed and authenticated
- A GCP project with billing enabled
- Required permissions: Cloud SQL Admin, Cloud Run Admin, Service Account Admin
- Node.js 20+ (for local development)

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Dashboard     │───▶│  Management API │───▶│  Cloud SQL      │
│ React Router 7  │    │   TypeScript    │    │  PostgreSQL     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       ▲
         │              ┌─────────────────┐
         └─────────────▶│  Test Service   │
                        │  Automated API  │
                        │     Testing     │
                        └─────────────────┘
```

## Complete Deployment

> **⚠️ IMPORTANT**: Before deployment, you must configure two files:
>
> 1. **Configuration**: Copy and edit `config/instance-config` with your PROJECT_ID and REGION
> 2. **Database Password (optional)**: Set your database password in `.secrets/password.pg.txt` (create file if it doesn't exist) If the password is missing, you can pass it as an argument to the deployment scripts as shown below.

### One-Command Deployment

```bash
cd gcp/infrastructure
cp config/instance-config.template config/instance-config
# Edit instance-config and set your PROJECT_ID and REGION

# First deployment (includes database setup)
./deploy-billing-resources.sh "YourSecurePassword123!"

# Subsequent deployments (skip database if it exists)
./deploy-billing-resources.sh --skip-db
```

### Manual Step-by-Step Deployment

If you prefer to deploy components individually:

```bash
# 1. Setup project and enable APIs
./setup-project.sh

# 2. Deploy database
./deploy-database.sh "YourSecurePassword123!"

# 3. Deploy management service
./deploy-flag-management.sh

# 4. Deploy dashboard
./deploy-dashboard.sh

# 5. Deploy test service
./deploy-cloud-test.sh
```

## Services Overview

### 1. Management Service (`plainflags-management`)

- **Technology**: TypeScript + Fastify + TypeORM
- **Database**: Cloud SQL PostgreSQL
- **Features**:
  - Create/List/Update/Delete flags
  - CORS-enabled API
  - Health monitoring
- **Endpoints**:
  - `GET /health` - Health check
  - `GET /api/flags` - List all flags
  - `POST /api/flags` - Create new flag
  - `PATCH /api/flags/:id` - Update flag
  - `DELETE /api/flags/:id` - Delete flag

### 2. Dashboard (`plainflags-dashboard`)

- **Technology**: React Router 7 + TypeScript + Tailwind CSS
- **Features**:
  - Real-time flag display
  - Summary statistics
  - Responsive design
  - Direct API integration
- **Routes**:
  - `/` - Dashboard home
  - `/flags` - Feature flags list view

### 3. Test Service (`plainflags-cloud-test`)

- **Technology**: TypeScript + Fastify
- **Purpose**: Automated API testing for deployed services
- **Features**:
  - Comprehensive flag API tests
  - Detailed test reporting
  - HTTP endpoint for external testing
  - Auto-browser opening on deployment
- **Endpoints**:
  - `POST /api/run-tests` - Execute full test suite
  - `GET /api/test-results` - List all test results
  - `GET /api/test-results/:id` - Get specific test result

## Infrastructure Scripts

### Deployment Scripts

- `setup-project.sh` - Enable GCP APIs and set up project
- `deploy-database.sh <password>` - Deploy Cloud SQL PostgreSQL
- `deploy-flag-management.sh` - Deploy management service
- `deploy-dashboard.sh` - Deploy React dashboard
- `deploy-cloud-test.sh` - Deploy test service
- `deploy-billing-resources.sh <password|--skip-db>` - Deploy all services

### Cleanup Scripts

- `cleanup.sh` - Remove all resources (includes non-billing resources)
- `cleanup-billing-resources.sh` - Remove only billing resources (recommended)
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

### Service URLs

After deployment, access your services at:

- **Management API**: `https://plainflags-management-PROJECT-REGION.run.app`
- **Dashboard**: `https://plainflags-dashboard-PROJECT-REGION.run.app`
- **Test Service**: `https://plainflags-cloud-test-PROJECT-REGION.run.app`

## Quick Testing

After deployment, verify everything is working:

```bash
# Check health endpoints
curl https://plainflags-management-PROJECT-REGION.run.app/health
curl https://plainflags-dashboard-PROJECT-REGION.run.app/health
curl https://plainflags-cloud-test-PROJECT-REGION.run.app/health

# Create a test flag
curl -X POST https://plainflags-management-PROJECT-REGION.run.app/api/flags \
  -H 'Content-Type: application/json' \
  -d '{"name":"test-flag"}'

# Run automated tests
curl -X POST https://plainflags-cloud-test-PROJECT-REGION.run.app/api/run-tests

# View dashboard in browser
open https://plainflags-dashboard-PROJECT-REGION.run.app
```

## Cost Management

To avoid ongoing charges when not actively developing:

```bash
# Delete all billing resources (recommended)
./cleanup-billing-resources.sh

# Or delete everything including IAM policies
./cleanup.sh
```

**Warning**: Database deletion permanently removes ALL flag data.

## Current Features

- ✅ **Complete TypeScript stack** (Management + Dashboard + Tests)
- ✅ **React Router 7 dashboard** with real-time data
- ✅ **Automated API testing** with detailed reporting
- ✅ **CORS-enabled APIs** for cross-origin access
- ✅ **Cloud SQL integration** with proper connection pooling
- ✅ **One-command deployment** and cleanup
- ✅ **Mobile-responsive UI** with Tailwind CSS
- ✅ **Error handling** and status monitoring

## Next Steps

1. Add authentication/authorization
2. Implement flag toggling and editing in dashboard
3. Add flag constraints and targeting rules
4. Set up CI/CD pipeline
5. Add monitoring and alerting
6. Implement flag change history

- Secrets and service accounts
- All Plain Flags data

For manual cleanup:

```bash
# Delete Cloud Run service
gcloud run services delete plainflags-management --region=us-central1

# Delete Cloud SQL instance (WARNING: This deletes all data)
gcloud sql instances delete plainflags-db

# Delete secrets
gcloud secrets delete plainflags-db-password

# Delete service account
gcloud iam service-accounts delete plainflags-runner@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

## Cost Estimation

- Cloud SQL (db-f1-micro): ~$7/month
- Cloud Run (minimal usage): ~$0-2/month
- **Total**: ~$7-9/month for basic usage
