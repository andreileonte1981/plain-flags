import axios, { AxiosInstance } from 'axios';
import { getIdToken } from '~/firebase';

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

export interface User {
    id: string;
    email: string;
    role: string;
}

export class ManagementApiClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private async buildClient(): Promise<AxiosInstance> {
        const token = await getIdToken();
        return axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            }
        });
    }

    async health(): Promise<any> {
        const client = await this.buildClient();
        const response = await client.get('/health');
        return response.data;
    }

    async createFlag(request: CreateFlagRequest): Promise<Flag> {
        const client = await this.buildClient();
        const response = await client.post('/api/flags', request);
        return response.data;
    }

    async listFlags(): Promise<Flag[]> {
        const client = await this.buildClient();
        const response = await client.get('/api/flags');
        return response.data;
    }

    async getMe(): Promise<{ id: string; email: string; role: string }> {
        const client = await this.buildClient();
        const response = await client.get('/api/users/me');
        return response.data;
    }

    async listUsers(): Promise<User[]> {
        const client = await this.buildClient();
        const response = await client.get('/api/users');
        return response.data;
    }

    async createUsers(emails: string, role?: string): Promise<{ created: string[]; errors: string[] }> {
        const client = await this.buildClient();
        const response = await client.post('/api/users/bulk', { emails, role });
        return response.data;
    }

    async deleteUser(id: string): Promise<void> {
        const client = await this.buildClient();
        await client.delete(`/api/users/${id}`);
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

export function resetApiClient(): void {
    apiClientInstance = null;
}
