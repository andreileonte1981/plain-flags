import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import Constraint from "../entities/constraint";

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

            reply.code(201).send(input)
        }
        catch (error: any) {
            server.log.error(error, `Flag creation error`)
            reply.code(304).send(error?.message || "Flag creation error")
        }
    })

    /**
     * Reply with list of all constraints.
     */
    server.get("", { onRequest: [(server as any).jwtAuth] }, async () => {
        const all = await Constraint.find()

        return all; // TODO: modify the response to have flag ID's instead of the flag objects.
    })
}
