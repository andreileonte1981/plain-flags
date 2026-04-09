import { FastifyInstance } from 'fastify';

const capabilities = {
    changepassword: false,
    resetpassword: true,
    firebase: true,
};

export default async function dashauthRoutes(fastify: FastifyInstance) {
    fastify.post<{ Body: { passkey?: string } }>('/api/dashauth', async (request, reply) => {
        const expectedPasskey = process.env.DASHBOARD_PASSKEY;
        if (!expectedPasskey || request.body?.passkey !== expectedPasskey) {
            reply.code(401).send({ message: 'Auth error' });
            return;
        }
        reply.send({
            success: true,
            disableUserRegistration: true,
            capabilities,
        });
    });
}
