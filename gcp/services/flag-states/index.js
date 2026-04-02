'use strict';

/**
 * Plain Flags — GCP flag states function (1st gen HTTP Cloud Function)
 *
 * Exposes a single endpoint consumed by the Plain Flags SDK libraries:
 *   GET /api/sdk
 *   Header: x-api-key: <your api key>
 *
 * The SDK is configured with this function's base URL as the serviceUrl.
 * All SDK variants (Node, Go, Dart, Python) work with this service unchanged.
 *
 * Environment variables (injected by Cloud Functions at deploy time):
 *   APIKEY                   — API key for authenticating SDK clients
 *   DB_PASSWORD              — PostgreSQL password (injected from Secret Manager)
 *   DB_NAME                  — Database name (default: plainflags)
 *   DB_USER                  — Database user (default: plainflags)
 *   CLOUD_SQL_CONNECTION_NAME — Cloud SQL instance connection name (Unix socket path)
 *   DB_HOST                  — Host for local/dev use when no Cloud SQL socket is set
 *   DB_PORT                  — Port for local/dev use (default: 5432)
 */

const { Pool } = require('pg');
const { Connector } = require('@google-cloud/cloud-sql-connector');

// Pool is initialised once per container instance and reused across warm invocations.
// Keeping `pool` in module scope is the recommended pattern for Cloud Functions.
let pool = null;
let connector = null;

async function getPool() {
    if (pool) return pool;

    const connectionName = process.env.CLOUD_SQL_CONNECTION_NAME;

    const base = {
        database: process.env.DB_NAME || 'plainflags',
        user: process.env.DB_USER || 'plainflags',
        password: process.env.DB_PASSWORD || '',
        // Small pool — Cloud Functions have a limited number of concurrent
        // instances and we want fast acquisition without overloading Cloud SQL.
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    };

    if (connectionName) {
        // Cloud SQL connector — connects via the Cloud SQL Admin API over TLS.
        // Works in 1st gen Cloud Functions without needing the Auth Proxy socket.
        connector = new Connector();
        const clientOpts = await connector.getOptions({
            instanceConnectionName: connectionName,
            authType: 'PASSWORD',
        });
        pool = new Pool({ ...base, ...clientOpts });
    } else {
        // Local / integration testing via TCP
        pool = new Pool({
            ...base,
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432', 10),
        });
    }

    return pool;
}

/**
 * HTTP Cloud Function entry point.
 *
 * Routing mirrors the self-hosted flag-states service so that SDK clients
 * can point at either variant without any code change.
 *
 * @param {import('@google-cloud/functions-framework').Request} req
 * @param {import('@google-cloud/functions-framework').Response} res
 */
exports.flagStates = async (req, res) => {
    // CORS — SDK clients may run from any origin
    res.set('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'x-api-key');
        res.set('Access-Control-Max-Age', '3600');
        return res.status(204).send('');
    }

    // Only the /api/sdk path is served; reject anything else
    if (req.path !== '/api/sdk') {
        return res.status(404).json({ error: 'Not Found' });
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // ── Authentication ────────────────────────────────────────────────────────
    const configuredKey = process.env.APIKEY || '';
    if (!configuredKey || req.headers['x-api-key'] !== configuredKey) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // ── Query ─────────────────────────────────────────────────────────────────
    try {
        const db = await getPool();

        // Single round-trip: fetch all active flags with their constraints.
        //
        // Join table name: TypeORM SnakeNamingStrategy produces
        //   flags_constraints_constraints
        // from (owning entity table: flags, property: constraints, related: constraints).
        // Column names follow the same strategy: flags_id, constraints_id.
        //
        // The `values` column is stored by TypeORM simple-array as a plain
        // comma-separated TEXT string, e.g. "John001,Steve002".
        const { rows } = await db.query(`
            SELECT
                f.name      AS flag_name,
                f.is_on,
                c.key       AS c_key,
                c.values    AS c_values
            FROM flags f
            LEFT JOIN flags_constraints_constraints fcc ON fcc.flags_id    = f.id
            LEFT JOIN constraints                   c   ON c.id             = fcc.constraints_id
            WHERE f.is_archived = false
            ORDER BY f.name
        `);

        // Reduce rows into { [flagName]: { isOn, constraints: [...] } }
        const result = {};
        for (const row of rows) {
            if (!result[row.flag_name]) {
                result[row.flag_name] = { isOn: row.is_on, constraints: [] };
            }
            if (row.c_key) {
                // TypeORM simple-array: stored as comma-separated text
                const values = typeof row.c_values === 'string'
                    ? row.c_values.split(',').map(v => v.trim()).filter(Boolean)
                    : (Array.isArray(row.c_values) ? row.c_values : []);

                result[row.flag_name].constraints.push({ key: row.c_key, values });
            }
        }

        return res.status(200).json(result);

    } catch (err) {
        console.error('Error querying flag states:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
