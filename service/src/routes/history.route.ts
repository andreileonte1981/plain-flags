import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import History from "../entities/history";

export async function historyRoutes(server: FastifyInstance) {
    server.post("", { onRequest: [(server as any).jwtAuth] }, async (
        request: FastifyRequest<{ Body: { flagId: string } }>,
        reply: FastifyReply
    ) => {
        const { flagId } = request.body;

        const allEntriesForFlag = await History.findBy({ flagId })

        const details = allEntriesForFlag.map(entry => {
            return {
                userEmail: entry.userEmail,
                what: entry.what,
                when: entry.when,
                constraintInfo: entry.constraintInfo
            }
        })

        reply.code(200).send(details)
    })
}
