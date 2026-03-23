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
