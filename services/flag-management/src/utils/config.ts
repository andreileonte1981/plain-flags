import { FastifyBaseLogger } from "fastify";
import * as fs from "fs/promises";

export default class Config {
    static jwtSigningSecret = ""
    static apiKey = "";
    static superAdminPassword = "";
    static defaultUserPassword = "";
    static defaultDashboardPasskey = "";

    static async init(log: FastifyBaseLogger) {
        try {
            const jwtSecretFile = process.env.JWT_SIGNING_SECRET_FILE;
            if (jwtSecretFile) {
                const secret = (await fs.readFile(jwtSecretFile)).toString()
                this.jwtSigningSecret = secret.trim()
            } else {
                this.jwtSigningSecret = process.env.JWT_SIGNING_SECRET || ""
            }

            const apiKeyFile = process.env.APIKEY_FILE;
            if (apiKeyFile) {
                const apiKey = (await fs.readFile(apiKeyFile)).toString();
                this.apiKey = apiKey.trim();
            } else {
                this.apiKey = process.env.APIKEY || "";
            }

            const superAdminPasswordFile = process.env.SUPERADMIN_PASSWORD_FILE;
            if (superAdminPasswordFile) {
                const superAdminPassword = (await fs.readFile(superAdminPasswordFile)).toString();
                this.superAdminPassword = superAdminPassword.trim();
            } else {
                this.superAdminPassword = process.env.SUPERADMIN_PASSWORD || "password";
            }

            const defaultUserPasswordFile = process.env.DEFAULT_USER_PASSWORD_FILE;
            if (defaultUserPasswordFile) {
                const defaultUserPassword = (await fs.readFile(defaultUserPasswordFile)).toString();
                this.defaultUserPassword = defaultUserPassword.trim();
            } else {
                this.defaultUserPassword = process.env.DEFAULT_USER_PASSWORD || "password";
            }

            const defaultDashboardPasskeyFile = process.env.DASHBOARD_PASSKEY_FILE;
            if (defaultDashboardPasskeyFile) {
                const defaultDashboardPasskey = (await fs.readFile(defaultDashboardPasskeyFile)).toString();
                this.defaultDashboardPasskey = defaultDashboardPasskey.trim();
            } else {
                this.defaultDashboardPasskey = process.env.DASHBOARD_PASSKEY || "passkey";
            }
        }
        catch (error) {
            log.error("Error initializing config: ", error)
            throw error
        }
    }
}
