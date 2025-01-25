import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import Constraint from "../entities/constraint";
import Flag from "../entities/flag";
import Flags from "../logic/flag-logic/flags";
import Recorder from "../logic/flag-history/recorder";
import User from "../entities/user";

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
            throw new Error("Constraint key can't be empty")
        }

        const constraint: Constraint = new Constraint()

        constraint.description = input.description
        constraint.key = input.key
        constraint.values = input.commaSeparatedValues.split(",").map(s => s.trim())

        await Constraint.insert(constraint)

        reply.code(201).send(constraint)
    })

    /**
     * Reply with list of all constraints.
     */
    server.get("", { onRequest: [(server as any).jwtAuth] }, async () => {
        const all = await Constraint.find({ relations: ["flags"] })

        return all.map(c => {
            return {
                ...c,
                flags: c.flags.map(f => {
                    return {
                        id: f.id,
                        name: f.name,
                        isOn: f.isOn
                    }
                })
            }
        });
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

        const constraint = await Constraint.findOne(
            { where: { id: input.constraintId }, relations: ["flags"] }
        )
        if (!constraint) { throw new Error(`Constraint ${input.constraintId} not found`) }

        const flag = await Flag.findOne(
            { where: { id: input.flagId }, relations: ["constraints"] }
        )
        if (!flag) { throw new Error(`Flag ${input.flagId} not found`) }

        if (!flag.constraints) { flag.constraints = [] }
        flag.constraints.push(constraint)

        if (!constraint.flags) { constraint.flags = [] }
        constraint.flags.push(flag)

        await Recorder.recordLink(request.user as User, flag, constraint)

        await flag.save()
        await constraint.save()

        reply.code(200).send(input)
    })

    server.post("/unlink", { onRequest: [(server as any).jwtAuth] }, async (
        request: FastifyRequest<{
            Body: {
                constraintId: string,
                flagId: string
            }
        }>,
        reply: FastifyReply
    ) => {
        const input = request.body

        const constraint = await Constraint.findOne({ loadRelationIds: true, where: { id: input.constraintId } })
        if (!constraint) { throw new Error(`Constraint ${input.constraintId} not found`) }

        const flag = await Flag.findOne({ loadRelationIds: true, where: { id: input.flagId } })
        if (!flag) { throw new Error(`Flag ${input.flagId} not found`) }

        flag.unlinkConstraint(input.constraintId)
        constraint.unlinkFlag(input.flagId)

        await Recorder.recordUnlink(request.user as User, flag, constraint)

        await flag.save()
        await constraint.save()

        reply.code(200).send(input)
    })

    server.post("/delete", { onRequest: [(server as any).jwtAuth] }, async (
        request: FastifyRequest<{
            Body: {
                id: string
            }
        }>,
        reply: FastifyReply
    ) => {
        const { id } = request.body

        const constraint = await Constraint.findOne({ relations: ["flags"], where: { id } })
        if (!constraint) { throw new Error(`Constraint ${id} not found`) }

        Flags.checkNoActiveFlagsWithConstraint(constraint)

        await Constraint.remove(constraint)

        reply.code(200).send("Deleted")
    })
}
