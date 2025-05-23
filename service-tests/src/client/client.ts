import axios from "axios"
import Config from "../utils/config";

export class Client {
    private instance?: Axios.AxiosInstance = undefined;

    constructor() {
        const baseurl = Config.managementServiceUrl()

        try {
            this.instance = axios.create({
                baseURL: baseurl,
                timeout: 20000
            });
        } catch (error) {
            console.error(error)
        }
    }

    public async get(url: string, token?: string): Promise<any> {
        if (token) {
            return await this.instance?.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
        }
        return await this.instance?.get(url)
    }

    public async post(url: string, payload: any, token?: string) {
        if (token) {
            return await this.instance?.post(url, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-api-key": process.env.APIKEY_MGT
                }
            })
        }

        return await this.instance?.post(url, payload, {
            headers: {
                "x-api-key": process.env.APIKEY_MGT
            }
        })
    }
}
