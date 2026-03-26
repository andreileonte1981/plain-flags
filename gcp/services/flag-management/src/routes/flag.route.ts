import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import Flag from '../entities/Flag';
import { requireAuth } from '../middleware/firebaseAuth';

// Request/Response interfaces
interface CreateFlagBody {
    name: string;
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

        try {
            // Check if flag already exists
            const existingFlag = await Flag.findOne({ where: { name } });

            if (existingFlag) {
                reply.code(409).send({
                    error: 'Conflict',
                    message: `Flag with name '${name}' already exists`
                });
                return;
            }

            // Create new flag
            const newFlag = Flag.create({
                name,
                isOn: false,
                isArchived: false
            });

            await newFlag.save();

            fastify.log.info(`Created flag: ${newFlag.name}`);

            reply.code(201).send({
                id: newFlag.id,
                name: newFlag.name,
                isOn: newFlag.isOn,
                isArchived: newFlag.isArchived,
                createdAt: newFlag.createdAt,
                updatedAt: newFlag.updatedAt
            });

        } catch (error) {
            fastify.log.error(error, 'Error creating flag');
            reply.code(500).send({
                error: 'Internal Server Error',
                message: 'Failed to create flag'
            });
        }
    });

    // List all flags
    fastify.get('/api/flags', { preHandler: requireAuth }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const flags = await Flag.find({
                where: { isArchived: false },
                order: { createdAt: 'DESC' }
            });

            const response = flags.map(flag => ({
                id: flag.id,
                name: flag.name,
                isOn: flag.isOn,
                isArchived: flag.isArchived,
                createdAt: flag.createdAt,
                updatedAt: flag.updatedAt
            }));

            reply.send(response);

        } catch (error) {
            fastify.log.error(error, 'Error fetching flags');
            reply.code(500).send({
                error: 'Internal Server Error',
                message: 'Failed to fetch flags'
            });
        }
    });
}
