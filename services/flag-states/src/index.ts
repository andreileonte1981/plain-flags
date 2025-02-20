import { fastify, FastifyReply, FastifyRequest } from "fastify";
import { Data } from "./data";
import { sdkRoutes } from "./routes/sdk.route";
import cors from "@fastify/cors"
import { StateSubscriber } from "./stateSubscriber";
import { StateBroadcaster } from "./stateBroadcaster";

const server = fastify({
    logger: (process.env.NODE_ENV === "production") ?
        true :
        { transport: { target: "pino-pretty" } }
})

async function start() {
    try {
        await StateSubscriber.init()
        await StateBroadcaster.init()

        await Data.init(server.log)

        server.setErrorHandler((error: any, request: FastifyRequest, reply: FastifyReply) => {
            server.log.error(error)
            reply.status(500).send({
                message: error.message,
            })
        })

        server.register(cors, {})

        server.register(sdkRoutes, { prefix: "/api/sdk" })

        await server.listen({ port: +(process.env.SERVICE_PORT || "5001"), host: "0.0.0.0" })
        server.log.info("State service listening")
    }
    catch (error) {
        server.log.error(error);
        console.error(error);
        process.exit(1)
    }
}

["SIGINT", "SIGTERM"].forEach((signal) => {
    process.on(signal, async () => {
        server.log.info(`${signal} signal received, exiting`)
        await server.close()

        process.exit(0)
    })
})

start()