# Plain Flags GCP Deployment

Minimal Google Cloud Platform deployment for Plain Flags with Cloud SQL PostgreSQL and Cloud Run.

## Prerequisites

- Google Cloud SDK installed and authenticated
- A GCP project with billing enabled
- Required permissions: Cloud SQL Admin, Cloud Run Admin, Service Account Admin

## Quick Start

### 1. Configure your deployment
```bash
cd gcp/infrastructure
cp instance-config.template instance-config
# Edit instance-config and set your PROJECT_ID and REGION
```

### 2. Set up GCP project
```bash
chmod +x *.sh
./setup-project.sh
```

### 3. Deploy database
```bash
./deploy-database.sh YOUR_SECURE_PASSWORD
```

### 4. Deploy flag-management service
```bash
./deploy-flag-management.sh
```

## Testing

After deployment, test your service:

```bash
# Health check
curl https://YOUR_SERVICE_URL/health

# Create a flag
curl -X POST https://YOUR_SERVICE_URL/api/flags \
  -H 'Content-Type: application/json' \
  -d '{"name":"test-flag"}'

# List flags
curl https://YOUR_SERVICE_URL/api/flags
```

## Current Implementation

This minimal version includes:

- **Database**: Cloud SQL PostgreSQL with basic flags table
- **Service**: Cloud Run service with flag create/list endpoints
- **Features**: 
  - Create flags (POST /api/flags)
  - List flags (GET /api/flags)
  - Health check (GET /health)
  - Proper error handling
  - Database connection pooling

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client/Test   │───▶│  Cloud Run      │───▶│  Cloud SQL      │
│                 │    │ flag-management │    │  PostgreSQL     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Next Steps

1. Test the basic functionality
2. Add authentication/authorization
3. Add flag-states service
4. Add more flag operations (toggle, delete, etc.)
5. Add frontend dashboard
6. Set up automated testing

## Cleanup

To remove all resources:

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