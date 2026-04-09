import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import Flag from '../entities/Flag';
import User, { Role } from '../entities/User';
import { requireAuth } from '../middleware/firebaseAuth';
import { Data } from '../data';
import Recorder from '../logic/flag-history/recorder';

// Request/Response interfaces
interface CreateFlagBody {
    name: string;
}

function flagResponse(flag: Flag) {
    return {
        id: flag.id,
        name: flag.name,
        isOn: flag.isOn,
        isArchived: flag.isArchived,
        stale: flag.stale,
        createdAt: flag.createdAt,
        updatedAt: flag.updatedAt,
        constraints: flag.constraints
            ? flag.constraints.map((c) => ({ id: c.id, description: c.description, key: c.key, values: c.values }))
            : undefined,
    };
}

export default async function flagRoutes(fastify: FastifyInstance) {
    // Create a flag
    fastify.post<{ Body: CreateFlagBody }>('/api/flags', {
        preHandler: requireAuth,
        schema: {
            body: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string', minLength: 1, maxLength: 255 }
                }
            }
        }
    }, async (request: FastifyRequest<{ Body: CreateFlagBody }>, reply: FastifyReply) => {
        const { name } = request.body;
        const user = (request as any).user as User;

        try {
            // Check if flag already exists (including archived — names are reserved)
            const existingFlag = await Flag.findOne({ where: { name } });

            if (existingFlag) {
                reply.code(409).send({
                    error: 'Conflict',
                    message: existingFlag.isArchived
                        ? `Name '${name}' is used by an archived flag. Please choose a different name.`
                        : `Flag with name '${name}' already exists`
                });
                return;
            }

            // Create new flag
            const newFlag = Flag.create({
                name,
                isOn: false,
                isArchived: false
            });

            await Data.getDataSource().transaction(async (em) => {
                await em.save(newFlag);
                const h = Recorder.recordCreation(user, newFlag);
                await em.save(h);
            });

            fastify.log.info(`Created flag: ${newFlag.name}`);

            reply.code(201).send(flagResponse(newFlag));

        } catch (error) {
            fastify.log.error(error, 'Error creating flag');
            reply.code(500).send({
                error: 'Internal Server Error',
                message: 'Failed to create flag'
            });
        }
    });

    // List all non-archived flags
    fastify.get('/api/flags', { preHandler: requireAuth }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const flags = await Flag.find({
                where: { isArchived: false },
                relations: ['constraints'],
                order: { createdAt: 'DESC' }
            });
            await Promise.all(flags.map(f => f.checkStale()));
            reply.send(flags.map(flagResponse));
        } catch (error) {
            fastify.log.error(error, 'Error fetching flags');
            reply.code(500).send({ error: 'Internal Server Error', message: 'Failed to fetch flags' });
        }
    });

    // Paginated list of archived flags — admin/superadmin only
    fastify.get<{ Querystring: { page?: string; pageSize?: string; filter?: string } }>(
        '/api/flags/archivedpage',
        { preHandler: requireAuth },
        async (request, reply) => {
            const requester = (request as any).user as User;
            if (requester.role !== Role.ADMIN && requester.role !== Role.SUPERADMIN) {
                reply.code(403).send({ message: 'Forbidden' });
                return;
            }
            const page = Math.max(1, parseInt(request.query.page ?? '1', 10));
            const pageSize = Math.min(100, Math.max(1, parseInt(request.query.pageSize ?? '20', 10)));
            const filter = request.query.filter ?? '';
            const [flags, count] = await Flag.createQueryBuilder('flag')
                .where('flag.isArchived = :isArchived', { isArchived: true })
                .andWhere('flag.name ILIKE :filter', { filter: `%${filter}%` })
                .orderBy('flag.updatedAt', 'DESC')
                .skip((page - 1) * pageSize)
                .take(pageSize)
                .getManyAndCount();
            reply.send({ count, flags: flags.map(flagResponse) });
        }
    );

    // Archive a flag (must be off; names stay reserved; unlinks all constraints)
    fastify.post<{ Body: { id: string } }>('/api/flags/archive', { preHandler: requireAuth }, async (request, reply) => {
        const user = (request as any).user as User;
        const flag = await Flag.findOne({ where: { id: request.body.id }, relations: ['constraints'] });
        if (!flag) {
            reply.code(404).send({ message: 'Flag not found' });
            return;
        }
        if (flag.isArchived) {
            reply.code(409).send({ message: 'Flag is already archived' });
            return;
        }
        if (flag.isOn) {
            reply.code(400).send({ message: 'Flag must be turned off before archiving' });
            return;
        }
        flag.unlinkAllConstraints();
        flag.isArchived = true;
        const h = Recorder.recordArchive(user, flag);
        await Data.getDataSource().transaction(async (em) => {
            await em.save(h);
            await em.save(flag);
        });
        reply.send(flagResponse(flag));
    });

    // Get a single flag by ID
    fastify.get<{ Params: { id: string } }>('/api/flags/:id', { preHandler: requireAuth }, async (request, reply) => {
        const flag = await Flag.findOne({ where: { id: request.params.id }, relations: ['constraints'] });
        if (!flag) {
            reply.code(404).send({ message: 'Flag not found' });
            return;
        }
        await flag.checkStale();
        reply.send(flagResponse(flag));
    });

    // Turn a flag on
    fastify.post<{ Body: { id: string } }>('/api/flags/turnon', { preHandler: requireAuth }, async (request, reply) => {
        const user = (request as any).user as User;
        const flag = await Flag.findOneBy({ id: request.body.id });
        if (!flag) {
            reply.code(404).send({ message: 'Flag not found' });
            return;
        }
        if (!flag.isOn) {
            flag.isOn = true;
            const h = Recorder.recordActivation(user, flag);
            await Data.getDataSource().transaction(async (em) => {
                await em.save(h);
                await em.save(flag);
            });
        }
        reply.send(flagResponse(flag));
    });

    // Turn a flag off
    fastify.post<{ Body: { id: string } }>('/api/flags/turnoff', { preHandler: requireAuth }, async (request, reply) => {
        const user = (request as any).user as User;
        const flag = await Flag.findOneBy({ id: request.body.id });
        if (!flag) {
            reply.code(404).send({ message: 'Flag not found' });
            return;
        }
        if (flag.isOn) {
            flag.isOn = false;
            const h = Recorder.recordDeactivation(user, flag);
            await Data.getDataSource().transaction(async (em) => {
                await em.save(h);
                await em.save(flag);
            });
        }
        reply.send(flagResponse(flag));
    });
}
