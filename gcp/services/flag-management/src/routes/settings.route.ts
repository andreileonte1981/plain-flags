import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import Settings from '../entities/Settings';
import User from '../entities/User';
import { requireAuth } from '../middleware/firebaseAuth';

export default async function settingsRoutes(fastify: FastifyInstance) {
    // Offset the virtual clock — test service account only, never in production
    fastify.post<{ Body: { days: number } }>(
        '/api/settings/daysOffset',
        { preHandler: requireAuth },
        async (request: FastifyRequest<{ Body: { days: number } }>, reply: FastifyReply) => {
            if (process.env.NODE_ENV === 'production') {
                reply.code(403).send({ message: 'Not available in production' });
                return;
            }

            const testServiceEmail = process.env.TEST_SERVICE_EMAIL;
            if (!testServiceEmail) {
                reply.code(403).send({ message: 'TEST_SERVICE_EMAIL is not configured' });
                return;
            }

            const requester = (request as any).user as User;
            if (requester.email !== testServiceEmail) {
                reply.code(403).send({ message: 'Forbidden' });
                return;
            }

            const { days } = request.body;

            const existing = await Settings.find();
            const setting = existing[0] ?? Settings.create();
            setting.offsetDays = days;
            await setting.save();

            reply.send({ days });
        }
    );
}
