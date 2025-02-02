import axios from "axios";

export default class Client {
    private static baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api/"

    static async post(url: string, data: any) {
        const token = localStorage.getItem("jwt");

        if (token) {
            try {
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
            } catch (error: any) {
                if (error.status === 401) {
                    alert("Unauthorized")

                    localStorage.removeItem("jwt")
                }
                throw error
            }
        }

        const response = await axios.post(`${this.baseUrl}${url}`, data)

        return response;
    }

    static async get(url: string) {
        const token = localStorage.getItem("jwt");

        try {
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
        catch (error: any) {
            if (error.status === 401) {
                alert("Unauthorized")

                localStorage.removeItem("jwt")
            }
            throw error
        }
    }
}
