import { FastifyInstance } from "fastify";
import { apiKeyAuth } from "../middleware/api-key.auth";
import { latestFlagState } from "../logic/flag-logic/flag-state";

export async function sdkRoutes(server: FastifyInstance) {
    // TODO: pass sdk version from client, do some service version matching in case there are breaking changes between versions.

    server.get("", { preHandler: apiKeyAuth }, async () => {
        const state = await latestFlagState()

        return state
    })
}
