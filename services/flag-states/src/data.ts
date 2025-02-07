import { DataSource } from "typeorm"
import Flag from "./entities/flag"
import { FastifyBaseLogger } from "fastify"
import { SnakeNamingStrategy } from "typeorm-naming-strategies"
import Constraint from "./entities/constraint"

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "../../data/plain-flags.sqlite",     // TODO: allow users to configure this
    logging: true,
    synchronize: (process.env.NODE_ENV !== "production"),
    namingStrategy: new SnakeNamingStrategy(),
    entities: [
        Flag,
        Constraint
    ],
})

export class Data {
    static async init(log: FastifyBaseLogger) {
        await AppDataSource.initialize().catch((err) => {
            log.error(`DB init error`, err)
            throw err
        })

        log.info("DB connected")
    }
}
