# Plain Flags Management Service (TypeScript)

Cloud-native TypeScript implementation of the Plain Flags management service using TypeORM and Cloud SQL.

## Development

```bash
# Install dependencies
npm install

# Build TypeScript locally
npm run compile

# Run locally (requires database connection)
npm start

# Development with watch mode
npm run dev
```

## Deployment

**Local compilation is required before deployment:**

```bash
# Build before deploying
npm run compile

# Deploy to Cloud Run (from infrastructure directory)
cd ../../infrastructure
./deploy-flag-management.sh
```

The deployment script uploads the pre-compiled `dist/` folder to Cloud Run.
This saves cloud build time and costs, ensuring faster and more predictable deployments.

## Environment Variables

- `PORT` - Server port (default: 8080)
- `NODE_ENV` - Environment (development/production)
- `DB_CONNECTION_NAME` - Cloud SQL connection name
- `DB_NAME` - Database name (default: plainflags)
- `DB_USER` - Database user (default: plainflags)
- `DB_PASSWORD` - Database password (from Secret Manager)

## API Endpoints

### Health Check

```
GET /health
```

### Create Flag

```
POST /api/flags
Content-Type: application/json

{
  "name": "feature-name"
}
```

### List Flags

```
GET /api/flags
```

## Database Schema

The service automatically creates the following table:

```sql
CREATE TABLE flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR UNIQUE NOT NULL,
  is_on BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
