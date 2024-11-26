import { FastifyInstance } from "fastify";
import Flag from "../entities/flags/flag";

export async function sdkRoutes(server: FastifyInstance) {
    server.get("", { onRequest: [(server as any).jwtAuth] }, async () => {
        const all = await Flag.findBy({ isArchived: false });

        const flagStates: { [flagName: string]: boolean } = {}
        for (const flag of all) {
            flagStates[flag.name] = flag.isOn
        }

        return flagStates
    })
}
