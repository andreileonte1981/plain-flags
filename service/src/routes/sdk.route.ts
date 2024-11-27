import { FastifyInstance } from "fastify";
import Flag from "../entities/flags/flag";
import { apiKeyAuth } from "../middleware/api-key.auth";

export async function sdkRoutes(server: FastifyInstance) {
    // TODO: pass sdk version from client, do some service version matching in case there are breaking changes between versions.

    // TODO: have an API key to secure this.
    server.get("", { preHandler: apiKeyAuth }, async () => {
        const all = await Flag.findBy({ isArchived: false });

        const flagStates: { [flagName: string]: boolean } = {}
        for (const flag of all) {
            flagStates[flag.name] = flag.isOn
        }

        return flagStates
    })
}
