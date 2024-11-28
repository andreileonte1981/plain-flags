import fastifyJwt from "@fastify/jwt";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fastifyPlugin from "fastify-plugin";

export default fastifyPlugin(async (server: FastifyInstance, options) => {
    server.register(fastifyJwt, {
        secret: process.env.JWT_SIGNING_SECRET || ""
    })

    server.decorate("jwtAuth", async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();
        }
        catch(error) {
            reply.code(401).send({message: `Unauthorized`})
        }
    })
})
