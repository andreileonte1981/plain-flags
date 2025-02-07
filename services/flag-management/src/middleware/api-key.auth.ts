import { FastifyReply, FastifyRequest } from "fastify";

export async function apiKeyAuth(request: FastifyRequest, reply: FastifyReply) {
    const apiKey = request.headers["x-api-key"];
    const knownKey = process.env.APIKEY

    if (apiKey !== knownKey) {
        return reply.code(401).send({ error: "Unauthorized" })
    }
}
