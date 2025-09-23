import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import Config from "../utils/config";

export async function dashauthRoutes(server: FastifyInstance) {
    server.post("", async (
        request: FastifyRequest<{ Body: { passkey: string } }>,
        reply: FastifyReply) => {
        if (request.body.passkey === Config.defaultDashboardPasskey) {
            return { success: true }
        } else {
            throw new Error("Auth error")
        }
    })
}
