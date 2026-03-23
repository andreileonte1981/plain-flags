import "reflect-metadata";
import Fastify from 'fastify';

const fastify = Fastify({
    logger: {
        level: 'info',
    }
});

// Health check endpoint
fastify.get('/health', async () => {
    return { status: 'ok', service: 'plainflags-management-test', env: process.env.NODE_ENV };
});

// Test endpoint
fastify.get('/test', async () => {
    return {
        message: 'Test endpoint working',
        env: {
            NODE_ENV: process.env.NODE_ENV,
            DB_CONNECTION_NAME: process.env.DB_CONNECTION_NAME,
            PORT: process.env.PORT
        }
    };
});

// Start server
async function start() {
    try {
        const port = parseInt(process.env.PORT || '8080');
        await fastify.listen({ port, host: '0.0.0.0' });

        fastify.log.info(`Test service listening on port ${port}`);

    } catch (error) {
        fastify.log.error(error);
        console.error(error);
        process.exit(1);
    }
}

start();