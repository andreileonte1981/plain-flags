import { FastifyBaseLogger } from "fastify";
import * as fs from "fs/promises";

export default class Config {
    static jwtSigningSecret = ""

    static async init(log: FastifyBaseLogger) {
        try {
            const secretFile = process.env.JWT_SIGNING_SECRET_FILE;
            if (secretFile) {
                const secret = (await fs.readFile(secretFile)).toString()

                this.jwtSigningSecret = secret.trim()
            }
            else {
                this.jwtSigningSecret = process.env.JWT_SIGNING_SECRET || ""
            }
        }
        catch (error) {
            log.error("Error initializing config: ", error)
            throw error
        }
    }
}
