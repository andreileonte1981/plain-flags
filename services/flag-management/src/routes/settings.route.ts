import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import Settings from "../entities/settings";

export async function settingsRoutes(server: FastifyInstance) {
    // TODO: protect with APIKEY
    server.post("/daysOffset", async (
        request: FastifyRequest,
        reply: FastifyReply
    ) => {
        if (process.env.NODE_ENV === "production") {
            const s = `Error setting daysOffset in production. Debug only endpoint`
            server.log.error(s)
            throw new Error(s)
        }

        const { days } = request.body as any

        const settings = await Settings.find();
        if (settings.length === 0) {
            const setting = new Settings()

            setting.offsetDays = days

            await setting.save()

            reply.code(201).send({ days })
        }
        else {
            const setting = settings[0]

            setting.offsetDays = days

            await setting.save()

            reply.code(200).send({ days })
        }
    })
}
