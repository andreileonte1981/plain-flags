import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import Constraint from "../entities/constraint";
import Flag from "../entities/flag";

export async function constraintRoutes(server: FastifyInstance) {
    /**
     * Create a constraint
     */
    server.post("", { onRequest: [(server as any).jwtAuth] }, async (
        request: FastifyRequest<{
            Body: {
                description: string
                key: string
                commaSeparatedValues: string
            }
        }>,
        reply: FastifyReply
    ) => {
        const input = request.body

        if (!input.key || input.key.trim().length === 0) {
            reply.code(304).send({ error: "Constraint key can't be empty" })
        }

        try {
            const constraint: Constraint = new Constraint()

            constraint.description = input.description
            constraint.key = input.key
            constraint.values = input.commaSeparatedValues.split(",").map(s => s.trim())

            await Constraint.insert(constraint)

            reply.code(201).send(constraint)
        }
        catch (error: any) {
            server.log.error(error, `Constraint creation error`)
            reply.code(304).send(error?.message || "Constraint creation error")
        }
    })

    /**
     * Reply with list of all constraints.
     */
    server.get("", { onRequest: [(server as any).jwtAuth] }, async () => {
        const all = await Constraint.find()

        return all; // TODO: modify the response to have flag ID's instead of the flag objects.
    })

    server.post("/link", { onRequest: [(server as any).jwtAuth] }, async (
        request: FastifyRequest<{
            Body: {
                constraintId: string,
                flagId: string
            }
        }>,
        reply: FastifyReply
    ) => {
        const input = request.body

        try {
            const constraint = await Constraint.findOneBy({ id: input.constraintId })
            if (!constraint) { throw new Error(`Constraint ${input.constraintId} not found`) }

            const flag = await Flag.findOneBy({ id: input.flagId })
            if (!flag) { throw new Error(`Flag ${input.flagId} not found`) }

            if (!flag.constraints) { flag.constraints = [] }
            flag.constraints.push(constraint)

            if (!constraint.flags) { constraint.flags = [] }
            constraint.flags.push(flag)

            await flag.save()
            await constraint.save()

            reply.code(200).send(input)
        }
        catch (error: any) {
            server.log.error(error, `Constraint link error`)
            reply.code(304).send(error?.message || "Constraint link error")
        }
    })
}
