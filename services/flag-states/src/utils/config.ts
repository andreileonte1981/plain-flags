import { FastifyBaseLogger } from "fastify";
import * as fs from "fs/promises";

export default class Config {
    static apiKey = ""

    static async init(log: FastifyBaseLogger) {
        try {
            const apiKeyFile = process.env.APIKEY_FILE
            if (apiKeyFile) {
                const apiKey = (await fs.readFile(apiKeyFile)).toString()
                this.apiKey = apiKey.trim()
            } else {
                this.apiKey = process.env.APIKEY || ""
            }
        }
        catch (error: any) {
            log.error("Error initializing config: ", error)
            throw error
        }
    }
}
