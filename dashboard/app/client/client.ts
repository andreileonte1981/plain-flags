import axios from "axios";

export default class Client {
    private static baseUrl = "http://127.0.0.1:5000/api/"

    static async post(url: string, data: any) {
        const token = localStorage.getItem("jwt");

        if (token) {
            const response = await axios.post(
                `${this.baseUrl}${url}`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return response
        }

        const response = await axios.post(`${this.baseUrl}${url}`, data)

        return response;
    }

    static async get(url: string) {
        const token = localStorage.getItem("jwt");

        const response = await axios.get(
            `${this.baseUrl}${url}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return response
    }
}
