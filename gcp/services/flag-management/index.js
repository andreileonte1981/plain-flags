import Fastify from 'fastify';
import { Connector } from '@google-cloud/cloud-sql-connector';
import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: process.env.NODE_ENV !== 'production' 
      ? { target: 'pino-pretty' }
      : undefined
  }
});

// Database connection
let db;

async function connectToDatabase() {
  const connector = new Connector();
  
  const clientOpts = await connector.getOptions({
    instanceConnectionName: process.env.DB_CONNECTION_NAME,
    ipType: 'PUBLIC',
  });

  const pool = new pg.Pool({
    ...clientOpts,
    user: process.env.DB_USER || 'plainflags',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'plainflags',
    max: 5,
  });

  return pool;
}

async function initializeDatabase(pool) {
  // Create flags table if it doesn't exist
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS flags (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) UNIQUE NOT NULL,
      is_on BOOLEAN DEFAULT FALSE,
      is_archived BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_flags_name ON flags(name);
    CREATE INDEX IF NOT EXISTS idx_flags_archived ON flags(is_archived);
  `;

  await pool.query(createTableQuery);
  fastify.log.info('Database initialized');
}

// Health check endpoint
fastify.get('/health', async () => {
  return { status: 'ok', service: 'plainflags-management' };
});

// Create a flag
fastify.post('/api/flags', {
  schema: {
    body: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 255 }
      }
    }
  }
}, async (request, reply) => {
  const { name } = request.body;
  
  try {
    // Check if flag already exists
    const existingFlag = await db.query(
      'SELECT id FROM flags WHERE name = $1',
      [name]
    );

    if (existingFlag.rows.length > 0) {
      reply.code(409).send({
        error: 'Conflict',
        message: `Flag with name '${name}' already exists`
      });
      return;
    }

    // Create new flag
    const result = await db.query(
      `INSERT INTO flags (id, name, is_on, is_archived, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [uuidv4(), name, false, false]
    );

    const newFlag = result.rows[0];

    fastify.log.info(`Created flag: ${newFlag.name}`);

    reply.code(201).send({
      id: newFlag.id,
      name: newFlag.name,
      isOn: newFlag.is_on,
      isArchived: newFlag.is_archived,
      createdAt: newFlag.created_at,
      updatedAt: newFlag.updated_at
    });

  } catch (error) {
    fastify.log.error(error, 'Error creating flag');
    reply.code(500).send({
      error: 'Internal Server Error',
      message: 'Failed to create flag'
    });
  }
});

// List all flags
fastify.get('/api/flags', async (request, reply) => {
  try {
    const result = await db.query(
      'SELECT * FROM flags WHERE is_archived = FALSE ORDER BY created_at DESC'
    );

    const flags = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      isOn: row.is_on,
      isArchived: row.is_archived,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    reply.send(flags);

  } catch (error) {
    fastify.log.error(error, 'Error fetching flags');
    reply.code(500).send({
      error: 'Internal Server Error',
      message: 'Failed to fetch flags'
    });
  }
});

// Start server
async function start() {
  try {
    // Connect to database
    db = await connectToDatabase();
    fastify.log.info('Connected to database');
    
    // Initialize database schema
    await initializeDatabase(db);
    
    // Start server
    const port = process.env.PORT || 8080;
    await fastify.listen({ port: parseInt(port), host: '0.0.0.0' });
    
    fastify.log.info(`Flag management service listening on port ${port}`);
    
  } catch (error) {
    fastify.log.error(error);
    console.error(error);
    process.exit(1);
  }
}

// Handle shutdown gracefully
const gracefulShutdown = async (signal) => {
  fastify.log.info(`Received ${signal}, shutting down gracefully`);
  
  try {
    if (db) {
      await db.end();
      fastify.log.info('Database connection closed');
    }
    
    await fastify.close();
    fastify.log.info('Server closed');
    
    process.exit(0);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

start();