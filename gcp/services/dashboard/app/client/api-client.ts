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

export class ManagementApiClient {
    private client: AxiosInstance;

    constructor(baseURL: string) {
        this.client = axios.create({
            baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async health(): Promise<any> {
        const response = await this.client.get('/health');
        return response.data;
    }

    async createFlag(request: CreateFlagRequest): Promise<Flag> {
        const response = await this.client.post('/api/flags', request);
        return response.data;
    }

    async listFlags(): Promise<Flag[]> {
        const response = await this.client.get('/api/flags');
        return response.data;
    }

    async getFlag(id: string): Promise<Flag> {
        const response = await this.client.get(`/api/flags/${id}`);
        return response.data;
    }

    async deleteFlag(id: string): Promise<void> {
        await this.client.delete(`/api/flags/${id}`);
    }

    async updateFlag(id: string, updates: Partial<Flag>): Promise<Flag> {
        const response = await this.client.patch(`/api/flags/${id}`, updates);
        return response.data;
    }
}

// Create a singleton instance that will be configured with the management service URL
let apiClientInstance: ManagementApiClient | null = null;

export function getApiClient(): ManagementApiClient {
    if (!apiClientInstance) {
        const managementUrl = typeof window !== 'undefined'
            ? window.ENV?.MANAGEMENT_SERVICE_URL
            : process.env.MANAGEMENT_SERVICE_URL;

        if (!managementUrl) {
            throw new Error('MANAGEMENT_SERVICE_URL environment variable not set');
        }

        apiClientInstance = new ManagementApiClient(managementUrl);
    }

    return apiClientInstance;
}