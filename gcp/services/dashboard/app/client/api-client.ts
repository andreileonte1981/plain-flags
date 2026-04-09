import axios, { AxiosInstance } from 'axios';
import { getIdToken } from '~/firebase';

export interface Flag {
    id: string;
    name: string;
    isOn: boolean;
    isArchived: boolean;
    stale: boolean;
    createdAt: string;
    updatedAt: string;
    constraints?: Array<{ id: string; description: string; key: string; values: string[] }>;
}

export interface Constraint {
    id: string;
    description: string;
    key: string;
    values: string[];
    createdAt: string;
    flags: Array<{ id: string; name: string; isOn: boolean }>;
}

export interface CreateConstraintRequest {
    description: string;
    key: string;
    commaSeparatedValues: string;
}

export interface HistoryEntry {
    userEmail: string;
    what: string;
    when: string;
    constraintInfo?: string;
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

    async getFlag(id: string): Promise<Flag> {
        const client = await this.buildClient();
        const response = await client.get(`/api/flags/${id}`);
        return response.data;
    }

    async turnOnFlag(id: string): Promise<Flag> {
        const client = await this.buildClient();
        const response = await client.post('/api/flags/turnon', { id });
        return response.data;
    }

    async turnOffFlag(id: string): Promise<Flag> {
        const client = await this.buildClient();
        const response = await client.post('/api/flags/turnoff', { id });
        return response.data;
    }

    async archiveFlag(id: string): Promise<Flag> {
        const client = await this.buildClient();
        const response = await client.post('/api/flags/archive', { id });
        return response.data;
    }

    async listArchivedFlags(page: number = 1, pageSize: number = 20, filter: string = ''): Promise<{ count: number; flags: Flag[] }> {
        const client = await this.buildClient();
        const response = await client.get(`/api/flags/archivedpage?page=${page}&pageSize=${pageSize}&filter=${encodeURIComponent(filter)}`);
        return response.data;
    }

    async createConstraint(request: CreateConstraintRequest): Promise<Constraint> {
        const client = await this.buildClient();
        const response = await client.post('/api/constraints', request);
        return response.data;
    }

    async listConstraints(): Promise<Constraint[]> {
        const client = await this.buildClient();
        const response = await client.get('/api/constraints');
        return response.data;
    }

    async updateConstraintValues(id: string, values: string): Promise<Constraint> {
        const client = await this.buildClient();
        const response = await client.post('/api/constraints/values', { id, values });
        return response.data;
    }

    async deleteConstraint(id: string): Promise<void> {
        const client = await this.buildClient();
        await client.post('/api/constraints/delete', { id });
    }

    async linkConstraint(flagId: string, constraintId: string): Promise<void> {
        const client = await this.buildClient();
        await client.post('/api/constraints/link', { flagId, constraintId });
    }

    async unlinkConstraint(flagId: string, constraintId: string): Promise<void> {
        const client = await this.buildClient();
        await client.post('/api/constraints/unlink', { flagId, constraintId });
    }

    async getHistory(flagId: string): Promise<HistoryEntry[]> {
        const client = await this.buildClient();
        const response = await client.post('/api/history', { flagId });
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

    async createUsers(emails: string, role?: string): Promise<string[]> {
        const client = await this.buildClient();
        const response = await client.post('/api/users/bulk', { emails, role });
        return response.data;
    }

    async deleteUser(id: string): Promise<void> {
        const client = await this.buildClient();
        await client.post('/api/users/delete', { id });
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
