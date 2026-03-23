import axios, { AxiosInstance, AxiosResponse } from 'axios';

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

    // Helper method to generate unique flag names
    static generateUniqueName(prefix: string = 'test'): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `${prefix}-${timestamp}-${random}`;
    }
}