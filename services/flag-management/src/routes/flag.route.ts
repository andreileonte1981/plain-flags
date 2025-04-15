import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import Flag from "../entities/flag";
import Recorder from "../logic/flag-history/recorder";
import User from "../entities/user";
import { AppDataSource } from "../data";

export async function flagRoutes(server: FastifyInstance) {
    /**
     * Create a flag
     */
    server.post("", { onRequest: [(server as any).jwtAuth] }, async (
        request: FastifyRequest<{ Body: { name: string } }>,
        reply: FastifyReply
    ) => {
        const flag = new Flag();

        flag.name = request.body.name;
        flag.isOn = false;
        flag.isArchived = false;

        const duplicate = await Flag.findOneBy({ name: flag.name })

        if (duplicate) {
            throw new Error(
                `Name '${flag.name}' is used by ${duplicate.isArchived ? "an archived" : "another"} flag.` +
                ` Please choose a different name.`
            )
        }

        await AppDataSource.transaction(async (transactionEntityManager) => {
            await transactionEntityManager.save(flag)

            const h = Recorder.recordCreation(request.user as User, flag)

            await transactionEntityManager.save(h)
        })

        reply.code(201).send(flag)
    })

    /**
     * Reply with list of all unarchived flags with added computed properties.
     */
    server.get("", { onRequest: [(server as any).jwtAuth] }, async () => {
        const all = await Flag.find({ relations: ["constraints"], where: { isArchived: false } })

        const checks = [];
        for (const flag of all) {
            checks.push(flag.checkStale())
        }

        Promise.allSettled(checks)

        return all.map((flag) => {
            return {
                ...flag,
                constraints: flag.constraints.map((constraint) => {
                    return {
                        id: constraint.id,
                        description: constraint.description,
                        key: constraint.key,
                        values: constraint.values
                    }
                }),
                updatedAt: undefined
            }
        });
    })

    server.get("/archived", { onRequest: [(server as any).jwtAuth] }, async () => {
        const all = await Flag.find({ where: { isArchived: true } })

        return all.map((flag) => {
            return {
                ...flag,
                updatedAt: undefined
            }
        });
    })

    /**
     * Details for a single flag
     */
    server.get(
        "/:flagId",
        { onRequest: [(server as any).jwtAuth] },
        async (request, reply) => {
            const flagDetails = await Flag.findOne({
                relations: ["constraints"],
                where: { id: (request as any)?.params?.flagId }
            })

            await flagDetails?.checkStale()

            return flagDetails
        }
    )

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
