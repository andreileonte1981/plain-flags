import { fastify } from "fastify";
import { Data } from "./data";
import { flagRoutes } from "./routes/flag.route";
import { userRoutes } from "./routes/user.route";
import jwtPlugin from "./plugins/jwtPlugin";

const server = fastify({
    logger: (process.env.NODE_ENV === 'production') ?
        true :
        { transport: { target: "pino-pretty" } }
})

async function start() {
    try {
        await Data.init(server.log)

        server.register(jwtPlugin)

        server.register(flagRoutes, { prefix: "/api/flags" })
        server.register(userRoutes, { prefix: "/api/users" })

        await server.listen({ port: +(process.env.SERVICE_PORT || "5000"), host: "0.0.0.0" })
        server.log.info("listening")
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