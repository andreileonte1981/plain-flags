import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import Flag from "../entities/flags/flag";

export async function flagRoutes(server: FastifyInstance) {
    server.post("", { onRequest: [(server as any).jwtAuth] }, async (
        request: FastifyRequest<{ Body: Flag }>,
        reply: FastifyReply
    ) => {
        const flag = request.body;
        flag.isOn = false;
        flag.isArchived = false;

        try {
            await Flag.insert(flag)

            reply.code(201).send(flag)
        }
        catch (error: any) {
            server.log.error(error, `Flag creation error`)
            reply.code(304).send(error?.message || "Flag creation error");
        }
    })

    server.get("", { onRequest: [(server as any).jwtAuth] }, async () => {
        const all = await Flag.findBy({ isArchived: false });

        return all;
    })

    server.post("/archive", { onRequest: [(server as any).jwtAuth] }, async (
        request: FastifyRequest<{ Body: { id: string } }>,
        reply: FastifyReply
    ) => {
        const flag = await Flag.findOneBy({ id: request.body.id })

        if (!flag) {
            return reply.code(404).send({ error: `Flag ${request.body.id} not found` })
        }

        if(flag.isOn){
            return reply.code(500).send({ error: `Flag ${request.body.id} is on, cannot archive` })
        }

        flag.isArchived = true;

        await flag.save();

        reply.code(200).send(flag)
    })

    server.post("/turnon", { onRequest: [(server as any).jwtAuth] }, async (
        request: FastifyRequest<{ Body: { id: string } }>,
        reply: FastifyReply
    ) => {
        const flag = await Flag.findOneBy({ id: request.body.id })

        if (!flag) {
            return reply.code(404).send({ error: `Flag ${request.body.id} not found` })
        }

        if (!flag.isOn) {
            flag.isOn = true;
            await flag.save();
        }
        else {
            server.log.warn(`Requested turn on for flag ${flag.id}, was already on`)
        }

        reply.code(200).send(flag)
    })

    server.post("/turnoff", { onRequest: [(server as any).jwtAuth] }, async (
        request: FastifyRequest<{ Body: { id: string } }>,
        reply: FastifyReply
    ) => {
        const flag = await Flag.findOneBy({ id: request.body.id })

        if (!flag) {
            return reply.code(404).send({ error: `Flag ${request.body.id} not found` })
        }

        if (flag.isOn !== false) {
            flag.isOn = false;
            await flag.save();
        }
        else {
            server.log.warn(`Requested turn off for flag ${flag.id}, was already off`)
        }

        reply.code(200).send(flag)
    })
}
