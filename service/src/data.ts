import { DataSource } from "typeorm"
import Flag, { FlagSubscriber } from "./entities/flag"
import { FastifyBaseLogger } from "fastify"
import { SnakeNamingStrategy } from "typeorm-naming-strategies"
import User from "./entities/user"
import History from "./entities/history"
import Settings from "./entities/settings"

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "plain-flags.sqlite",
    logging: true,
    synchronize: (process.env.NODE_ENV !== "production"),
    namingStrategy: new SnakeNamingStrategy(),
    entities: [
        Flag,
        User,
        History,
        Settings
    ],
    subscribers: [
        FlagSubscriber
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
