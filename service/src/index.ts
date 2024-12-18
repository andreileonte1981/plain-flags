import { fastify } from "fastify";
import { Data } from "./data";
import { flagRoutes } from "./routes/flag.route";
import { userRoutes } from "./routes/user.route";
import jwtPlugin from "./plugins/jwtPlugin";
import { sdkRoutes } from "./routes/sdk.route";
import { historyRoutes } from "./routes/history.route";
import { settingsRoutes } from "./routes/settings.route";
import { constraintRoutes } from "./routes/constraint.route";
import cors from "@fastify/cors"

const server = fastify({
    logger: (process.env.NODE_ENV === "production") ?
        true :
        { transport: { target: "pino-pretty" } }
})

async function start() {
    try {
        await Data.init(server.log)

        server.register(jwtPlugin)

        server.register(cors, {})

        server.register(sdkRoutes, { prefix: "/api/sdk" })
        server.register(flagRoutes, { prefix: "/api/flags" })
        server.register(constraintRoutes, {prefix: "/api/constraints"})
        server.register(userRoutes, { prefix: "/api/users" })
        server.register(historyRoutes, {prefix: "/api/history"})
        server.register(settingsRoutes, {prefix: "/api/settings"})

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