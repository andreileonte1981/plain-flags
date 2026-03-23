import "reflect-metadata";
import Fastify from 'fastify';
import { Data } from './data';
import flagRoutes from './routes/flag.route';

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

// Register route modules
fastify.register(flagRoutes);

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