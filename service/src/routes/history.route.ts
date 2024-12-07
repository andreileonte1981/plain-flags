import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import History from "../entities/history";

export async function historyRoutes(server: FastifyInstance) {
    server.post("/flagid", { onRequest: [(server as any).jwtAuth] }, async (
        request: FastifyRequest<{ Body: {flagId: string} }>,
        reply: FastifyReply
    ) => {
        const { flagId } = request.body;

        try {
            const allEntriesForFlag = await History.findBy( { flagId })

            reply.code(200).send(allEntriesForFlag)
        }
        catch (error: any) {
            server.log.error(error, `History retrieval error for flag ${flagId}`)
            reply.code(304).send(error?.message || "Flag history retrieval error");
        }
    })
}
