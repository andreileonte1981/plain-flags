import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import User from "../entities/user";
import * as bcrypt from "bcrypt";

export async function userRoutes(server: FastifyInstance) {
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
            email
        });

        reply.code(200).send({ token })
    })
}
