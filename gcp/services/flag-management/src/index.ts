import "reflect-metadata";
import Fastify from 'fastify';
import { Data } from './data';
import flagRoutes from './routes/flag.route';
import userRoutes from './routes/user.route';
import settingsRoutes from './routes/settings.route';
import constraintRoutes from './routes/constraint.route';
import Users from './logic/users';
// Import to ensure Firebase Admin is initialized before routes use it
import './middleware/firebaseAuth';

const fastify = Fastify({
    logger: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport: process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined
    }
});

// Register CORS plugin
fastify.register(require('@fastify/cors'), {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
});

// Health check endpoint (unauthenticated)
fastify.get('/health', async () => {
    return { status: 'ok', service: 'plainflags-management' };
});

// Register route modules
fastify.register(flagRoutes);
fastify.register(userRoutes);
fastify.register(constraintRoutes);
fastify.register(settingsRoutes);

// Start server
async function start() {
    try {
        // Initialize database connection
        await Data.init(fastify.log);
        fastify.log.info('Database initialized successfully');

        // Bootstrap superadmin if no users exist
        await Users.makeAdminIfNone();
        fastify.log.info('User bootstrap complete');

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