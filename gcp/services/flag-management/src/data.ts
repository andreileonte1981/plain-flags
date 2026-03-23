import { DataSource } from "typeorm";
import { AuthTypes, Connector, DriverOptions, IpAddressTypes } from "@google-cloud/cloud-sql-connector";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import Flag from "./entities/Flag";
import { FastifyBaseLogger } from "fastify";

const entities = [Flag];

let AppDataSource: DataSource;

export class Data {
    static async init(logger: FastifyBaseLogger): Promise<void> {
        try {
            // Debug environment variables
            logger.info('Environment variables: NODE_ENV=%s, DB_CONNECTION_NAME=%s, DB_NAME=%s, DB_USER=%s, PORT=%s',
                process.env.NODE_ENV,
                process.env.DB_CONNECTION_NAME,
                process.env.DB_NAME,
                process.env.DB_USER,
                process.env.PORT
            );

            // Validate required environment variables
            const connectionName = process.env.DB_CONNECTION_NAME;
            if (!connectionName) {
                throw new Error('DB_CONNECTION_NAME environment variable is required');
            }

            logger.info(`Connecting to Cloud SQL instance: ${connectionName}`);

            // Create Cloud SQL connector
            const connector = new Connector();

            try {
                const clientOpts: DriverOptions = await connector.getOptions({
                    instanceConnectionName: connectionName,
                    ipType: IpAddressTypes.PUBLIC,
                    authType: AuthTypes.IAM, // Use IAM authentication for better security
                });

                // For Cloud Run, the connector typically returns socket options
                AppDataSource = new DataSource({
                    type: "postgres",
                    username: process.env.DB_USER || 'plainflags',
                    password: process.env.DB_PASSWORD || '',
                    database: process.env.DB_NAME || 'plainflags',
                    extra: {
                        ...clientOpts
                    },
                    entities,
                    synchronize: true, // For development - creates tables automatically
                    logging: process.env.NODE_ENV !== 'production',
                    namingStrategy: new SnakeNamingStrategy(),
                });
            } catch (connectorError) {
                logger.error(`Cloud SQL connector failed: ${JSON.stringify(connectorError, null, 2)}`);
                throw connectorError;
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