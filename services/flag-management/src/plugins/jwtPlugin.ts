import fastifyJwt from "@fastify/jwt";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fastifyPlugin from "fastify-plugin";
import User from "../entities/user";
import Config from "../utils/config";

export default fastifyPlugin(async (server: FastifyInstance, options) => {
    server.register(fastifyJwt, {
        secret: Config.jwtSigningSecret
    })

    server.decorate("jwtAuth", async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify()

            const user = await User.findOneBy({ id: (request.user as User).id })

            if (!user) { throw new Error("User missing") }
        }
        catch (error) {
            reply.code(401).send({ message: `Unauthorized` })
        }
    })
})
