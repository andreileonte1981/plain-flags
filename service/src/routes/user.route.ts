import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import User from "../entities/user";
import * as bcrypt from "bcrypt";

export async function userRoutes(server: FastifyInstance) {
    server.post("", async (
        request: FastifyRequest<{ Body: User }>,
        reply: FastifyReply
    ) => {
        const user = request.body;

        try {
            if (!user.email.trim().length || !user.password.trim().length) {
                throw new Error("User registration error - invalid username & password");
            }

            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(user.password, salt)

            await User.insert(user)

            reply.code(201).send(user)
        }
        catch (error: any) {
            server.log.error(error, `User registration error`)
            reply.code(304).send({ error, customError: error.message || "User registration error" });
        }
    })

    server.post("/login", async (
        request: FastifyRequest<{ Body: { email: string, password: string } }>,
        reply: FastifyReply
    ) => {
        const { email, password } = request.body;

        try {
            const user = await User.findOneBy({ email });

            if (!user) {
                return reply.code(401).send({ error: `Wrong email and/or password` })
            }

            const match = await bcrypt.compare(password, user.password)

            if (!match) {
                return reply.code(401).send({ error: `Wrong email and/or password` })
            }

            const token = server.jwt.sign({
                id: user.id,
                email
            });

            reply.code(200).send({ token })
        }
        catch (error: any) {
            server.log.error(error, `Login error`)
            reply.code(304).send(error?.message || "Login error");
        }
    })
}
