import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import User, { Role } from "../entities/user";
import * as bcrypt from "bcrypt";

export async function userRoutes(server: FastifyInstance) {
    server.get("", { onRequest: [(server as any).jwtAuth] }, async (
        request: FastifyRequest,
        reply: FastifyReply
    ) => {
        const user: User = request.user as User
        if (user.role !== Role.ADMIN) {
            throw new Error("Forbidden")
        }

        const users = await User.find()

        return users.map(user => { return { id: user.id, email: user.email, role: user.role } })
    })

    server.post("", async (
        request: FastifyRequest<{ Body: User }>,
        reply: FastifyReply
    ) => {
        const user = request.body;

        if (!user.email.trim().length || !user.password.trim().length) {
            throw new Error("User registration error - invalid username and/or password");
        }

        const duplicate = await User.findOneBy({ email: user.email })
        if (duplicate) {
            throw new Error(`User with email '${user.email} is already registered`)
        }

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, salt)

        await User.insert(user)

        reply.code(201).send(user)
    })

    server.post("/login", async (
        request: FastifyRequest<{ Body: { email: string, password: string } }>,
        reply: FastifyReply
    ) => {
        const { email, password } = request.body;

        const user = await User.findOneBy({ email });

        if (!user) {
            throw new Error(`Wrong email and/or password`)
        }

        const match = await bcrypt.compare(password, user.password)

        if (!match) {
            throw new Error(`Wrong email and/or password`)
        }

        const token = server.jwt.sign({
            id: user.id,
            email,
            role: user.role
        });

        reply.code(200).send({ token, user: { email: user.email, role: user.role } })
    })

    server.post("/changePassword", { onRequest: [(server as any).jwtAuth] }, async (
        request: FastifyRequest<{ Body: { currentPassword: string, newPassword: string } }>,
        reply: FastifyReply
    ) => {
        const userId = (request.user as User).id;
        const { currentPassword, newPassword } = request.body;

        if (newPassword.trim().length === 0) {
            throw new Error(`Invalid password. Please select a more secure password.`)
        }

        const user = await User.findOneBy({ id: userId })
        if (!user) {
            throw new Error(`User error`)
        }

        const match = await bcrypt.compare(currentPassword, user.password)

        if (!match) {
            throw new Error(`Wrong current password`)
        }

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(newPassword, salt)

        await user.save()

        reply.code(200).send({ email: user.email })
    })
}
