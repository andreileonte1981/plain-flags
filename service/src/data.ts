import { DataSource } from "typeorm"
import Flag from "./entities/flags/flag"
import { FastifyBaseLogger } from "fastify"
import { SnakeNamingStrategy } from "typeorm-naming-strategies"
import User from "./entities/users/user"
import History from "./entities/history/history"

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "plain-flags.sqlite",
    logging: true,
    synchronize: (process.env.NODE_ENV !== "production"),
    namingStrategy: new SnakeNamingStrategy(),
    entities: [
        Flag,
        User,
        History
    ]
})

export class Data {
    static async init(log: FastifyBaseLogger){
        await AppDataSource.initialize().catch((err) => {
            log.error(`DB init error`, err)
            throw err
        })

        log.info("DB connected")
    }
}
