import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import Flag from "../entities/flag";
import Recorder from "../logic/flag-history/recorder";
import User, { Role } from "../entities/user";
import { AppDataSource } from "../data";
import cleanString from "../utils/profanity";
import Flags from "../logic/flag-logic/flags";

export async function flagRoutes(server: FastifyInstance) {
    /**
     * Create a flag
     */
    server.post("", { onRequest: [(server as any).jwtAuth] }, async (
        request: FastifyRequest<{ Body: { name: string } }>,
        reply: FastifyReply
    ) => {
        const flag = new Flag();

        const user = (request as any).user as User;

        if (user.role == Role.DEMO) {
            flag.name = cleanString(request.body.name)
        }
        else {
            flag.name = request.body.name
        }

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

            const h = Recorder.recordCreation((request as any).user as User, flag)

            await transactionEntityManager.save(h)
        }).catch((error) => {
            server.log.error(error)

            throw error
        })

        if (process.env.DEMO_MODE === "true") {
            Flags.deleteExcessFlagsAndConstraints(server.log)
        }

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

    server.get("/archivedpage", { onRequest: [(server as any).jwtAuth] }, async (
        request: FastifyRequest, reply
    ) => {
        const q: any = request.query;

        const all = await Flag.createQueryBuilder("flag").select()
            .where("flag.isArchived = :isArchived", { isArchived: true })
            .andWhere("name LIKE :filter", { filter: `%${q.filter}%` })
            .orderBy("flag.updatedAt", "DESC")
            .skip((q.page - 1) * q.pageSize)
            .take(q.pageSize)
            .getMany()

        const count = await Flag.createQueryBuilder("flag").select()
            .where("flag.isArchived = :isArchived", { isArchived: true })
            .andWhere("name LIKE :filter", { filter: `%${q.filter}%` })
            .getCount()

        const flags = all.map((flag) => {
            return {
                ...flag,
                updatedAt: undefined
            }
        });

        return { count, flags }
    })

    /**
     * TODO: Deprecate this on next major update
     */
    server.get("/archived", { onRequest: [(server as any).jwtAuth] }, async (
    ) => {
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
        const requesterId = (request.user as { id: string }).id
        const requester = await User.findOneBy({ id: requesterId })

        if (requester?.role === Role.DEMO) {
            throw new Error("Demo users cannot archive flags")
        }

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

        const h = Recorder.recordArchive((request as any).user as User, flag)

        await AppDataSource.transaction(async (transactionEntityManager) => {
            await transactionEntityManager.save(h)

            await transactionEntityManager.save(flag)
        }).catch((error) => {
            server.log.error(error)

            throw error
        })

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

            const h = Recorder.recordActivation((request as any).user as User, flag)

            await AppDataSource.transaction(async (transactionEntityManager) => {
                await transactionEntityManager.save(h)

                await transactionEntityManager.save(flag)
            }).catch((error) => {
                server.log.error(error)

                throw error
            })
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

            const h = Recorder.recordDeactivation((request as any).user as User, flag)

            await AppDataSource.transaction(async (transactionEntityManager) => {
                await transactionEntityManager.save(h)

                await transactionEntityManager.save(flag)
            }).catch((error) => {
                server.log.error(error)

                throw error
            })
        }
        else {
            server.log.warn(`Requested turn off for flag ${flag.id}, was already off`)
        }

        reply.code(200).send(flag)
    })
}
