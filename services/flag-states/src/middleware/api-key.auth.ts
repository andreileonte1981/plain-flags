import { FastifyReply, FastifyRequest } from "fastify";
import Config from "../utils/config";

export async function apiKeyAuth(request: FastifyRequest, reply: FastifyReply) {
    const apiKey = request.headers["x-api-key"]
    const knownKey = Config.apiKey

    if (apiKey !== knownKey) {
        return reply.code(401).send({ error: "Unauthorized" })
    }
}
