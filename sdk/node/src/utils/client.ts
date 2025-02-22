import axios from "axios"

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
