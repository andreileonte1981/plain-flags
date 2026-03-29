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
 * Sign in to Firebase with email/password to get an ID token.
 * Firebase ID tokens are accepted by the management service's requireAuth middleware.
 */
async function signInWithFirebase(apiKey: string, email: string, password: string): Promise<string> {
    const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(apiKey)}`,
        { email, password, returnSecureToken: true }
    );
    return response.data.idToken as string;
}

export class ManagementApiClient {
    private baseURL: string;
    private token: string | null = null;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    /**
     * Initialise the client by signing in to Firebase with the test runner credentials.
     * Must be called once before using authenticated methods.
     */
    async init(): Promise<void> {
        const apiKey = process.env.FIREBASE_API_KEY;
        const email = process.env.TEST_USER_EMAIL;
        const password = process.env.TEST_USER_PASSWORD;
        if (!apiKey || !email || !password) {
            throw new Error('Missing Firebase credentials: FIREBASE_API_KEY, TEST_USER_EMAIL, TEST_USER_PASSWORD must be set');
        }
        this.token = await signInWithFirebase(apiKey, email, password);
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

    async getMe(): Promise<{ id: string; email: string; role: string }> {
        const response = await this.buildClient().get('/api/users/me');
        return response.data;
    }

    /** Returns the HTTP status from /api/users/me using an arbitrary bearer token. */
    async getMeStatus(token: string): Promise<number> {
        try {
            await axios.get(`${this.baseURL}/api/users/me`, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 10000,
            });
            return 200;
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
