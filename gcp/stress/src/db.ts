import { Pool } from 'pg';
import { Connector, AuthTypes } from '@google-cloud/cloud-sql-connector';

let pool: Pool | null = null;
let connector: Connector | null = null;

export async function getPool(): Promise<Pool> {
    if (pool) return pool;

    const connectionName = process.env.CLOUD_SQL_CONNECTION_NAME;

    const base = {
        database: process.env.DB_NAME || 'plainflags',
        user: process.env.DB_USER || 'plainflags',
        password: process.env.DB_PASSWORD || '',
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    };

    if (connectionName) {
        connector = new Connector();
        const clientOpts = await connector.getOptions({
            instanceConnectionName: connectionName,
            authType: AuthTypes.PASSWORD,
        });
        pool = new Pool({ ...base, ...clientOpts });
    } else {
        pool = new Pool({
            ...base,
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432', 10),
        });
    }

    return pool;
}

export async function closePool(): Promise<void> {
    if (pool) {
        await pool.end();
        pool = null;
    }
    if (connector) {
        connector.close();
        connector = null;
    }
}
