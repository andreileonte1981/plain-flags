import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import Flag from "../entities/flag";
import Recorder from "../logic/flag-history/recorder";
import User from "../entities/user";

export async function flagRoutes(server: FastifyInstance) {
    /**
     * Create a flag
     */
    server.post("", { onRequest: [(server as any).jwtAuth] }, async (
        request: FastifyRequest<{ Body: Flag }>,
        reply: FastifyReply
    ) => {
        const flag = request.body;
        flag.isOn = false;
        flag.isArchived = false;

        // TODO: check uniqueness specifically with a find and throw a readable error on duplicates.
        await Flag.insert(flag)

        await Recorder.recordCreation(request.user as User, flag).catch((error) => {
            server.log.error(`Flag was created but the event failed to be recorded.`, error)
        })

        reply.code(201).send(flag)
    })

    /**
     * Reply with list of all unarchived flags with added computed properties.
     */
    server.get("", { onRequest: [(server as any).jwtAuth] }, async () => {
        const all = await Flag.find({ loadRelationIds: true, where: { isArchived: false } })

        const checks = [];
        for (const flag of all) {
            checks.push(flag.checkStale())
        }

        Promise.allSettled(checks)

        return all;
    })

    /**
     * Flags are never deleted, to avoid accidental overlapping flag checks in user source code.
     * They are archived forever and hidden from regular operation, but names are unique even across archived flags.
     */
    server.post("/archive", { onRequest: [(server as any).jwtAuth] }, async (
        request: FastifyRequest<{ Body: { id: string } }>,
        reply: FastifyReply
    ) => {
        const flag = await Flag.findOne({ where: { id: request.body.id }, relations: ["constraints"] })

        if (!flag) {
            throw new Error(`Flag ${request.body.id} not found`)
        }

        if (flag.isOn) {
            throw new Error(`Flag ${request.body.id} is on, cannot archive`)
        }

        if (flag.isArchived) {
            throw new Error(`Flag ${request.body.id} is already archived`)
        }

        flag.unlinkAllConstraints()

        flag.isArchived = true;

        await Recorder.recordArchive(request.user as User, flag).catch((error) => {
            server.log.error(`Flag was archived but the event failed to be recorded.`, error)
        })

        await flag.save();

        reply.code(200).send(flag)
    })

    server.post("/turnon", { onRequest: [(server as any).jwtAuth] }, async (
        request: FastifyRequest<{ Body: { id: string } }>,
        reply: FastifyReply
    ) => {
        const flag = await Flag.findOneBy({ id: request.body.id })

        if (!flag) {
            throw new Error(`Flag ${request.body.id} not found`)
        }

        if (!flag.isOn) {
            flag.isOn = true;

            await Recorder.recordActivation(request.user as User, flag).catch((error) => {
                server.log.error(`Flag was turned on but the event failed to be recorded.`, error)
            });

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
            throw new Error(`Flag ${request.body.id} not found`)
        }

        if (flag.isOn !== false) {
            flag.isOn = false;

            await Recorder.recordDeactivation(request.user as User, flag).catch((error) => {
                server.log.error(`Flag was turned off but the event failed to be recorded.`, error)
            })

            await flag.save();
        }
        else {
            server.log.warn(`Requested turn off for flag ${flag.id}, was already off`)
        }

        reply.code(200).send(flag)
    })
}
