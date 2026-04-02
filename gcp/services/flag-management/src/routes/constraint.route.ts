import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import Constraint from '../entities/Constraint';
import Flag from '../entities/Flag';
import User from '../entities/User';
import { requireAuth } from '../middleware/firebaseAuth';
import { Data } from '../data';
import Recorder from '../logic/flag-history/recorder';

function constraintResponse(constraint: Constraint) {
    return {
        id: constraint.id,
        description: constraint.description,
        key: constraint.key,
        values: constraint.values,
        createdAt: constraint.createdAt,
        flags: constraint.flags
            ? constraint.flags.map((f) => ({ id: f.id, name: f.name, isOn: f.isOn }))
            : [],
    };
}

export default async function constraintRoutes(fastify: FastifyInstance) {
    // Create a constraint
    fastify.post<{ Body: { description: string; key: string; commaSeparatedValues: string } }>(
        '/api/constraints',
        { preHandler: requireAuth },
        async (request: FastifyRequest<{ Body: { description: string; key: string; commaSeparatedValues: string } }>, reply: FastifyReply) => {
            const { description, key, commaSeparatedValues } = request.body;

            if (!key || key.trim().length === 0) {
                reply.code(400).send({ message: "Constraint key can't be empty" });
                return;
            }

            const duplicate = await Constraint.findOneBy({ description });
            if (duplicate) {
                reply.code(409).send({ message: `Description '${description}' is the same as another constraint` });
                return;
            }

            const constraint = new Constraint();
            constraint.description = description;
            constraint.key = key;
            constraint.values = commaSeparatedValues.split(',').map((s) => s.trim());

            await Constraint.insert(constraint);

            constraint.flags = [];
            reply.code(201).send(constraintResponse(constraint));
        }
    );

    // Update constraint values
    fastify.post<{ Body: { id: string; values: string } }>(
        '/api/constraints/values',
        { preHandler: requireAuth },
        async (request, reply) => {
            const user = (request as any).user as User;
            const constraint = await Constraint.findOne({ where: { id: request.body.id }, relations: ['flags'] });
            if (!constraint) {
                reply.code(404).send({ message: `Constraint ${request.body.id} not found` });
                return;
            }

            const oldValues = [...constraint.values];
            constraint.values = request.body.values.split(',').map((s) => s.trim());

            const historyEntries = (constraint.flags ?? []).map((f) =>
                Recorder.recordConstraintEdit(user, f, constraint, oldValues)
            );

            await Data.getDataSource().transaction(async (em) => {
                await em.save(constraint);
                for (const h of historyEntries) {
                    await em.save(h);
                }
            });

            reply.send(constraintResponse(constraint));
        }
    );

    // List all constraints with their linked flags
    fastify.get('/api/constraints', { preHandler: requireAuth }, async (_request, reply) => {
        const all = await Constraint.find({ relations: ['flags'] });
        reply.send(all.map(constraintResponse));
    });

    // Link constraint to flag
    fastify.post<{ Body: { constraintId: string; flagId: string } }>(
        '/api/constraints/link',
        { preHandler: requireAuth },
        async (request, reply) => {
            const user = (request as any).user as User;
            const { constraintId, flagId } = request.body;

            const constraint = await Constraint.findOne({ where: { id: constraintId }, relations: ['flags'] });
            if (!constraint) {
                reply.code(404).send({ message: `Constraint ${constraintId} not found` });
                return;
            }

            const flag = await Flag.findOne({ where: { id: flagId }, relations: ['constraints'] });
            if (!flag) {
                reply.code(404).send({ message: `Flag ${flagId} not found` });
                return;
            }

            if (!flag.constraints) { flag.constraints = []; }
            flag.constraints.push(constraint);

            const h = Recorder.recordLink(user, flag, constraint);
            await Data.getDataSource().transaction(async (em) => {
                await em.save(flag);
                await em.save(h);
            });

            reply.code(200).send({ constraintId, flagId });
        }
    );

    // Unlink constraint from flag
    fastify.post<{ Body: { constraintId: string; flagId: string } }>(
        '/api/constraints/unlink',
        { preHandler: requireAuth },
        async (request, reply) => {
            const user = (request as any).user as User;
            const { constraintId, flagId } = request.body;

            const constraint = await Constraint.findOne({ where: { id: constraintId }, relations: ['flags'] });
            if (!constraint) {
                reply.code(404).send({ message: `Constraint ${constraintId} not found` });
                return;
            }

            const flag = await Flag.findOne({ where: { id: flagId }, relations: ['constraints'] });
            if (!flag) {
                reply.code(404).send({ message: `Flag ${flagId} not found` });
                return;
            }

            flag.unlinkConstraint(constraintId);
            constraint.unlinkFlag(flagId);

            const h = Recorder.recordUnlink(user, flag, constraint);
            await Data.getDataSource().transaction(async (em) => {
                await em.save(flag);
                await em.save(h);
            });

            reply.code(200).send({ constraintId, flagId });
        }
    );

    // Delete a constraint
    fastify.post<{ Body: { id: string } }>(
        '/api/constraints/delete',
        { preHandler: requireAuth },
        async (request, reply) => {
            const { id } = request.body;

            const constraint = await Constraint.findOne({ where: { id }, relations: ['flags'] });
            if (!constraint) {
                reply.code(404).send({ message: `Constraint ${id} not found` });
                return;
            }

            const activeFlags = constraint.flags ? constraint.flags.filter((f) => f.isOn) : [];
            if (activeFlags.length) {
                reply.code(400).send({
                    message: `Cannot delete constraint; it's linked to active flags ${activeFlags.map((f) => f.name).join(', ')}. Unlink first`,
                });
                return;
            }

            // Explicitly unlink from all linked flags before removal to keep join table consistent
            for (const linkedFlag of constraint.flags || []) {
                const flag = await Flag.findOne({ where: { id: linkedFlag.id }, relations: ['constraints'] });
                if (flag) {
                    flag.unlinkConstraint(id);
                    await flag.save();
                }
            }

            await Constraint.remove(constraint);

            reply.code(200).send('Deleted');
        }
    );
}
