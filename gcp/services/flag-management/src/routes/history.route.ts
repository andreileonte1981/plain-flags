import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import History from '../entities/History';
import { requireAuth } from '../middleware/firebaseAuth';

export default async function historyRoutes(fastify: FastifyInstance) {
    fastify.post<{ Body: { flagId: string } }>(
        '/api/history',
        { preHandler: requireAuth },
        async (request: FastifyRequest<{ Body: { flagId: string } }>, reply: FastifyReply) => {
            const { flagId } = request.body;

            const entries = await History.find({ where: { flagId }, order: { when: 'ASC' } });

            reply.send(entries.map((e) => ({
                userEmail: e.userEmail,
                what: e.what,
                when: e.when,
                constraintInfo: e.constraintInfo,
            })));
        }
    );
}
