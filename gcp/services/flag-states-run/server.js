'use strict';

/**
 * Plain Flags — GCP flag states service (Cloud Run variant)
 *
 * Same behaviour as the Cloud Function variant (flag-states/index.js) but
 * runs as a persistent HTTP server suitable for Cloud Run.  Setting
 * min-instances=1 at deploy time gives always-on availability with no cold
 * starts.
 *
 * Exposes a single endpoint consumed by the Plain Flags SDK libraries:
 *   GET /api/sdk
 *   Header: x-api-key: <your api key>
 *
 * All SDK variants (Node, Go, Dart, Python) work with this service unchanged.
 *
 * Environment variables (injected by Cloud Run at deploy time):
 *   APIKEY                    — API key for authenticating SDK clients
 *   DB_PASSWORD               — PostgreSQL password (injected from Secret Manager)
 *   DB_NAME                   — Database name (default: plainflags)
 *   DB_USER                   — Database user (default: plainflags)
 *   CLOUD_SQL_CONNECTION_NAME — Cloud SQL instance connection name
 *   DB_HOST                   — Host for local/dev use when no Cloud SQL socket is set
 *   DB_PORT                   — Port for local/dev use (default: 5432)
 *   PORT                      — HTTP port to listen on (injected by Cloud Run, default: 8080)
 */

const http = require('http');
const { Pool } = require('pg');
const { Connector } = require('@google-cloud/cloud-sql-connector');

// Pool is initialised once and reused across all requests.
let pool = null;
let connector = null;

async function getPool() {
    if (pool) return pool;

    const connectionName = process.env.CLOUD_SQL_CONNECTION_NAME;

    const base = {
        database: process.env.DB_NAME || 'plainflags',
        user: process.env.DB_USER || 'plainflags',
        password: process.env.DB_PASSWORD || '',
        // Larger pool than the Cloud Function variant — this is a persistent
        // process so connections can be held without impacting other instances.
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    };

    if (connectionName) {
        // Cloud SQL connector — connects via the Cloud SQL Admin API over TLS.
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

function jsonResponse(res, status, body) {
    const json = JSON.stringify(body);
    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(json),
    });
    res.end(json);
}

async function handleRequest(req, res) {
    // CORS — SDK clients may run from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Access-Control-Allow-Headers', 'x-api-key');
        res.setHeader('Access-Control-Max-Age', '3600');
        res.writeHead(204);
        res.end();
        return;
    }

    // Only the /api/sdk path is served; reject anything else
    const pathname = new URL(req.url, 'http://x').pathname;
    if (pathname !== '/api/sdk') {
        return jsonResponse(res, 404, { error: 'Not Found' });
    }

    if (req.method !== 'GET') {
        return jsonResponse(res, 405, { error: 'Method Not Allowed' });
    }

    // ── Authentication ────────────────────────────────────────────────────────
    const configuredKey = process.env.APIKEY || '';
    if (!configuredKey || req.headers['x-api-key'] !== configuredKey) {
        return jsonResponse(res, 401, { error: 'Unauthorized' });
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

        return jsonResponse(res, 200, result);

    } catch (err) {
        console.error('Error querying flag states:', err);
        return jsonResponse(res, 500, { error: 'Internal Server Error' });
    }
}

const PORT = parseInt(process.env.PORT || '8080', 10);
const server = http.createServer((req, res) => {
    handleRequest(req, res).catch(err => {
        console.error('Unhandled error in request handler:', err);
        if (!res.headersSent) {
            jsonResponse(res, 500, { error: 'Internal Server Error' });
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`plainflags-states service listening on port ${PORT}`);
});
