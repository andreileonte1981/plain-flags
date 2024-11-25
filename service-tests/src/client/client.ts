import axios from "axios"

export class Client {
    private instance?: Axios.AxiosInstance = undefined;

    constructor() {
        const baseurl: string = "http:/127.0.0.1:5000"; // TODO - configure it
        try {
            this.instance = axios.create({
                baseURL: baseurl,
                timeout: 2000
            });
        } catch (error) {
            console.error(error)
        }
    }

    public async get(url: string, token?: string): Promise<any> {
        if(token){
            return await this.instance?.get(url, {headers: {Authorization: `Bearer ${token}`}})
        }
        return await this.instance?.get(url)
    }

    public async post(url: string, payload: any, token?: string) {
        if(token) {
            return await this.instance?.post(url, payload, {headers: {Authorization: `Bearer ${token}`}})
        }

        return await this.instance?.post(url, payload)
    }
}
