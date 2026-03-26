import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import User, { Role } from "../entities/User";
import { firebaseAdmin, requireAuth } from "../middleware/firebaseAuth";

export default async function userRoutes(fastify: FastifyInstance) {
    /**
     * GET /api/users — admin/superadmin only
     */
    fastify.get(
        "/api/users",
        { preHandler: requireAuth },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const requester = (request as any).user as User;
            if (requester.role !== Role.ADMIN && requester.role !== Role.SUPERADMIN) {
                reply.code(403).send({ message: "Forbidden" });
                return;
            }

            const users = await User.find({ order: { created_at: "ASC" } });

            return users.map((u) => ({ id: u.id, email: u.email, role: u.role }));
        }
    );

    /**
     * POST /api/users/bulk — create one or more users (admin/superadmin only)
     * Body: { emails: string (comma-separated), role?: "admin" | "user" }
     */
    fastify.post<{ Body: { emails: string; role?: string } }>(
        "/api/users/bulk",
        { preHandler: requireAuth },
        async (request: FastifyRequest<{ Body: { emails: string; role?: string } }>, reply: FastifyReply) => {
            const requester = (request as any).user as User;
            if (requester.role !== Role.ADMIN && requester.role !== Role.SUPERADMIN) {
                reply.code(403).send({ message: "Forbidden" });
                return;
            }

            const role = (request.body.role as Role) || Role.USER;
            if (role === Role.SUPERADMIN) {
                reply.code(403).send({ message: "Cannot create superadmin via API" });
                return;
            }

            const emails = request.body.emails
                .split(",")
                .map((e) => e.trim())
                .filter((e) => e.length > 0);

            const created: string[] = [];
            const errors: string[] = [];

            for (const email of emails) {
                try {
                    // Create or reuse Firebase Auth user
                    let firebaseUser: import("firebase-admin/auth").UserRecord;
                    try {
                        firebaseUser = await firebaseAdmin.auth().getUserByEmail(email);
                    } catch {
                        firebaseUser = await firebaseAdmin.auth().createUser({ email });
                    }

                    // Check if already provisioned
                    const existing = await User.findOneBy({ email });
                    if (existing) {
                        errors.push(`${email}: already exists`);
                        continue;
                    }

                    const user = new User();
                    user.firebase_uid = firebaseUser.uid;
                    user.email = email;
                    user.role = role;
                    await User.insert(user);

                    created.push(email);
                } catch (err: any) {
                    errors.push(`${email}: ${err.message}`);
                }
            }

            reply.code(201).send({ created, errors });
        }
    );

    /**
     * DELETE /api/users/:id — delete a user (admin/superadmin only).
     * Superadmin cannot be deleted.
     */
    fastify.delete<{ Params: { id: string } }>(
        "/api/users/:id",
        { preHandler: requireAuth },
        async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            const requester = (request as any).user as User;
            if (requester.role !== Role.ADMIN && requester.role !== Role.SUPERADMIN) {
                reply.code(403).send({ message: "Forbidden" });
                return;
            }

            const { id } = request.params;
            const target = await User.findOneBy({ id });

            if (!target) {
                reply.code(404).send({ message: "User not found" });
                return;
            }

            if (target.role === Role.SUPERADMIN) {
                reply.code(403).send({ message: "Cannot delete superadmin" });
                return;
            }

            await User.delete({ id });

            reply.code(200).send({ id });
        }
    );
}
