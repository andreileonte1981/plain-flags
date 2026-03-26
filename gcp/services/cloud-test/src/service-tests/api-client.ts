import axios, { AxiosInstance } from 'axios';

export interface Flag {
    id: string;
    name: string;
    isOn: boolean;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateFlagRequest {
    name: string;
}

/**
 * Fetch a GCP OIDC identity token for the management service audience.
 * Uses the GCP metadata server available in Cloud Run environments.
 */
async function fetchOidcToken(audience: string): Promise<string> {
    const metadataUrl =
        `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity` +
        `?audience=${encodeURIComponent(audience)}&format=full`;

    const response = await axios.get(metadataUrl, {
        headers: { 'Metadata-Flavor': 'Google' },
        timeout: 5000,
    });

    return response.data as string;
}

export class ManagementApiClient {
    private baseURL: string;
    private token: string | null = null;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    /**
     * Initialise the client by fetching an OIDC token from the metadata server.
     * Must be called once before using authenticated methods.
     */
    async init(): Promise<void> {
        this.token = await fetchOidcToken(this.baseURL);
    }

    private buildClient(authenticated: boolean = true): AxiosInstance {
        return axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                ...(authenticated && this.token
                    ? { Authorization: `Bearer ${this.token}` }
                    : {}),
            }
        });
    }

    /** Unauthenticated health check — must remain accessible without a token */
    async health(): Promise<any> {
        const response = await this.buildClient(false).get('/health');
        return response.data;
    }

    async createFlag(request: CreateFlagRequest): Promise<Flag> {
        const response = await this.buildClient().post('/api/flags', request);
        return response.data;
    }

    async listFlags(): Promise<Flag[]> {
        const response = await this.buildClient().get('/api/flags');
        return response.data;
    }

    /**
     * Attempt an unauthenticated request to a protected endpoint.
     * Returns the HTTP status code of the response.
     */
    async unauthenticatedListFlags(): Promise<number> {
        try {
            await this.buildClient(false).get('/api/flags');
            return 200; // Should not reach here
        } catch (error: any) {
            return error?.response?.status ?? 0;
        }
    }

    // Helper method to generate unique flag names
    static generateUniqueName(prefix: string = 'test'): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `${prefix}-${timestamp}-${random}`;
    }
}
