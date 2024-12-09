import { FastifyInstance } from "fastify";
import Flag from "../entities/flag";
import { apiKeyAuth } from "../middleware/api-key.auth";
import { FlagState } from "../logic/flag-logic/flag-state";

export async function sdkRoutes(server: FastifyInstance) {
    // TODO: pass sdk version from client, do some service version matching in case there are breaking changes between versions.

    server.get("", { preHandler: apiKeyAuth }, async () => {
        const all = await Flag.find(
            { where: { isArchived: false }, relations: ["constraints"] }
        )

        const flagStates: { [flagName: string]: FlagState } = {}

        for (const flag of all) {
            const constraints = flag.constraints.map(c => ({
                key: c.key, values: c.values
            }))
            flagStates[flag.name] = {
                isOn: flag.isOn,
                constraints
            }
        }

        return flagStates
    })
}
