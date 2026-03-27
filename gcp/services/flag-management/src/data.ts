import { DataSource } from "typeorm";
import { AuthTypes, Connector, DriverOptions, IpAddressTypes } from "@google-cloud/cloud-sql-connector";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import Flag from "./entities/Flag";
import User from "./entities/User";
import { FastifyBaseLogger } from "fastify";

const entities = [Flag, User];

let AppDataSource: DataSource;

export class Data {
    static async init(logger: FastifyBaseLogger): Promise<void> {
        try {
            const connectionName = process.env.DB_CONNECTION_NAME;

            if (connectionName) {
                // ── Cloud SQL (Cloud Run) ──────────────────────────────────────
                logger.info(`Connecting to Cloud SQL instance: ${connectionName}`);

                const connector = new Connector();
                const clientOpts: DriverOptions = await connector.getOptions({
                    instanceConnectionName: connectionName,
                    ipType: IpAddressTypes.PUBLIC,
                    authType: AuthTypes.IAM,
                });

                AppDataSource = new DataSource({
                    type: "postgres",
                    username: process.env.DB_USER || 'plainflags',
                    password: process.env.DB_PASSWORD || '',
                    database: process.env.DB_NAME || 'plainflags',
                    extra: { ...clientOpts },
                    entities,
                    synchronize: true,
                    logging: false,
                    namingStrategy: new SnakeNamingStrategy(),
                });
            } else {
                // ── Local TCP (docker-compose-gcp-local.yml) ──────────────────
                const host = process.env.DB_HOST || 'localhost';
                const port = parseInt(process.env.DB_PORT || '5432');
                logger.info(`Connecting to local PostgreSQL at ${host}:${port}`);

                AppDataSource = new DataSource({
                    type: "postgres",
                    host,
                    port,
                    username: process.env.DB_USER || 'plainflags',
                    password: process.env.DB_PASSWORD || '',
                    database: process.env.DB_NAME || 'plainflags',
                    entities,
                    synchronize: true,
                    logging: true,
                    namingStrategy: new SnakeNamingStrategy(),
                });
            }

            await AppDataSource.initialize();
            logger.info("Database connection established successfully");

        } catch (error) {
            logger.error(error, "Error during database initialization");
            throw error;
        }
    }

    static getDataSource(): DataSource {
        return AppDataSource;
    }

    static async close(): Promise<void> {
        if (AppDataSource?.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

export { AppDataSource };