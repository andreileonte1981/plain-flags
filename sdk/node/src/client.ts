import axios from "axios"

export interface StateUpdateConfig {
    readonly policy: "manual" | "poll"
}

export interface ManualStateUpdateConfig extends StateUpdateConfig {
    readonly policy: "manual"
    readonly serviceUrl: string
    readonly apiKey: string
}

export interface PollStateUpdateConfig extends StateUpdateConfig {
    readonly policy: "poll"
    readonly serviceUrl: string
    readonly pollInterval: number
    readonly apiKey: string
}

export class Client {
    private instance?: Axios.AxiosInstance = undefined;

    constructor(
        private apiKey: string,
        baseurl: string = "http:/127.0.0.1:5000"
    ) {
        try {
            this.instance = axios.create({
                baseURL: baseurl,
                timeout: 2000
            });
        } catch (error) {
            throw error
        }
    }

    public async get(url: string): Promise<any> {
        return await this.instance?.get(url, { headers: { "x-api-key": this.apiKey } })
    }
}
