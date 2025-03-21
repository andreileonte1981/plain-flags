import { DataSource } from "typeorm"
import Flag, { FlagSubscriber } from "./entities/flag"
import { FastifyBaseLogger } from "fastify"
import { SnakeNamingStrategy } from "typeorm-naming-strategies"
import User from "./entities/user"
import History from "./entities/history"
import Settings from "./entities/settings"
import Constraint from "./entities/constraint"
import * as path from "upath"

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: path.join(process.env.DATA_FOLDER_PATH || "../../data", "plain-flags.sqlite"),
    logging: true,
    synchronize: false,
    namingStrategy: new SnakeNamingStrategy(),
    entities: [
        Flag,
        User,
        History,
        Settings,
        Constraint
    ],
    subscribers: [
        FlagSubscriber,
    ],
    migrations: process.env.NODE_ENV === "migration" ? ["./migrations/*.ts"] : []
})

export class Data {
    static async init(log: FastifyBaseLogger) {
        await AppDataSource.initialize().catch((err) => {
            log.error(`DB init error`, err)
            throw err
        })

        log.info("DB connected")

        const queryRunner = AppDataSource.createQueryRunner()

        await queryRunner.query('PRAGMA journal_mode = WAL;');
        await queryRunner.query('PRAGMA synchronous = normal;');
        await queryRunner.query('PRAGMA temp_store = memory;');
        await queryRunner.query('PRAGMA mmap_size = 30000000000;');

        log.info("DB optimized")
    }
}
