# Plain Flags GCP Dashboard

A React Router 7-based dashboard for managing feature flags in the GCP deployment of Plain Flags.

## Features

- **Flags Overview**: View all feature flags with their current status
- **Summary Statistics**: See count of active, inactive, and archived flags
- **Real-time Data**: Connects directly to the management service API
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **React Router 7**: Modern React framework with server-side rendering
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **Axios**: HTTP client for API communication
- **Vite**: Fast build tool and dev server

## API Client

The dashboard uses a similar HTTP client pattern as the test service:

```typescript
import { getApiClient } from "~/client/api-client";

const client = getApiClient();
const flags = await client.listFlags();
```

## Environment Variables

- `MANAGEMENT_SERVICE_URL`: URL of the Plain Flags management service

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Deployment

Use the deployment scripts in the infrastructure folder:

```bash
# Deploy to GCP
cd ../infrastructure
./deploy-dashboard.sh

# Delete from GCP
./delete-dashboard.sh
```

## Routes

- `/` - Home page with link to flags
- `/flags` - Main flags list view
