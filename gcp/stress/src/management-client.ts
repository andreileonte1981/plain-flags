import axios, { AxiosInstance } from 'axios';

export interface Flag {
    id: string;
    name: string;
    isOn: boolean;
    isArchived: boolean;
    constraints?: Array<{ id: string; description: string; key: string; values: string[] }>;
}

export interface Constraint {
    id: string;
    description: string;
    key: string;
    values: string[];
    flags: Array<{ id: string; name: string }>;
}

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

    async init(): Promise<void> {
        const apiKey = process.env.FIREBASE_API_KEY;
        const email = process.env.TEST_USER_EMAIL;
        const password = process.env.TEST_USER_PASSWORD;
        if (!apiKey || !email || !password) {
            throw new Error('Missing credentials: FIREBASE_API_KEY, TEST_USER_EMAIL, TEST_USER_PASSWORD must be set');
        }
        this.token = await signInWithFirebase(apiKey, email, password);
    }

    private http(authenticated = true): AxiosInstance {
        return axios.create({
            baseURL: this.baseURL,
            timeout: 15000,
            headers: {
                'Content-Type': 'application/json',
                ...(authenticated && this.token ? { Authorization: `Bearer ${this.token}` } : {}),
            },
        });
    }

    async createFlag(name: string): Promise<Flag> {
        const res = await this.http().post('/api/flags', { name });
        return res.data;
    }

    async listFlags(): Promise<Flag[]> {
        const res = await this.http().get('/api/flags');
        return res.data;
    }

    async turnOnFlag(id: string): Promise<void> {
        await this.http().post('/api/flags/turnon', { id });
    }

    async createConstraint(description: string, key: string, commaSeparatedValues: string): Promise<Constraint> {
        const res = await this.http().post('/api/constraints', { description, key, commaSeparatedValues });
        return res.data;
    }

    async linkConstraint(flagId: string, constraintId: string): Promise<void> {
        await this.http().post('/api/constraints/link', { flagId, constraintId });
    }
}
