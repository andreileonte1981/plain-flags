import "reflect-metadata";
import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import { Data } from './data';
import Flag from './entities/Flag';

const fastify = Fastify({
    logger: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport: process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined
    }
});

// Health check endpoint
fastify.get('/health', async () => {
    return { status: 'ok', service: 'plainflags-management' };
});

// Create a flag
interface CreateFlagBody {
    name: string;
}

fastify.post<{ Body: CreateFlagBody }>('/api/flags', {
    schema: {
        body: {
            type: 'object',
            required: ['name'],
            properties: {
                name: { type: 'string', minLength: 1, maxLength: 255 }
            }
        }
    }
}, async (request: FastifyRequest<{ Body: CreateFlagBody }>, reply: FastifyReply) => {
    const { name } = request.body;

    try {
        // Check if flag already exists
        const existingFlag = await Flag.findOne({ where: { name } });

        if (existingFlag) {
            reply.code(409).send({
                error: 'Conflict',
                message: `Flag with name '${name}' already exists`
            });
            return;
        }

        // Create new flag
        const newFlag = Flag.create({
            name,
            isOn: false,
            isArchived: false
        });

        await newFlag.save();

        fastify.log.info(`Created flag: ${newFlag.name}`);

        reply.code(201).send({
            id: newFlag.id,
            name: newFlag.name,
            isOn: newFlag.isOn,
            isArchived: newFlag.isArchived,
            createdAt: newFlag.createdAt,
            updatedAt: newFlag.updatedAt
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
fastify.get('/api/flags', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const flags = await Flag.find({
            where: { isArchived: false },
            order: { createdAt: 'DESC' }
        });

        const response = flags.map(flag => ({
            id: flag.id,
            name: flag.name,
            isOn: flag.isOn,
            isArchived: flag.isArchived,
            createdAt: flag.createdAt,
            updatedAt: flag.updatedAt
        }));

        reply.send(response);

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
        // Initialize database connection
        await Data.init(fastify.log);
        fastify.log.info('Database initialized successfully');

        // Start server
        const port = parseInt(process.env.PORT || '8080');
        await fastify.listen({ port, host: '0.0.0.0' });

        fastify.log.info(`Flag management service listening on port ${port}`);

    } catch (error) {
        fastify.log.error(error);
        console.error(error);
        process.exit(1);
    }
}

// Handle shutdown gracefully
const gracefulShutdown = async (signal: string) => {
    fastify.log.info(`Received ${signal}, shutting down gracefully`);

    try {
        await Data.close();
        fastify.log.info('Database connection closed');

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