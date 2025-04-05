import { DataSource, DataSourceOptions } from "typeorm"
import Flag, { FlagSubscriber } from "./entities/flag"
import { FastifyBaseLogger } from "fastify"
import { SnakeNamingStrategy } from "typeorm-naming-strategies"
import User from "./entities/user"
import History from "./entities/history"
import Settings from "./entities/settings"
import Constraint from "./entities/constraint"
import * as path from "upath"
import * as fs from "fs"

const entities = [
    Flag,
    User,
    History,
    Settings,
    Constraint
]

const sqliteConfig: DataSourceOptions = {
    type: "sqlite",
    database: path.join(process.env.DATA_FOLDER_PATH || "../../data", "plain-flags.sqlite"),
    logging: true,
    synchronize: false,
    namingStrategy: new SnakeNamingStrategy(),
    entities,
    subscribers: [
        FlagSubscriber,
    ],
    migrations: process.env.NODE_ENV === "migration" ? ["./migrations/*.ts"] : []
}

const pwdPath = process.env.DATABASE_PASSWORD_FILE
let password = process.env.DATABASE_PASSWORD || "password"

if (pwdPath) {
    const pwdFromFile = fs.readFileSync(pwdPath)
    password = pwdFromFile.toString()
}

const pgConfig: DataSourceOptions = {
    type: "postgres",
    host: process.env.DATABASE_HOST,
    port: +(process.env.DATABASE_PORT || 5432),
    username: process.env.DATABASE_USER,
    password,
    logging: true,
    synchronize: false,
    poolSize: 64,
    connectTimeoutMS: 15000,
    poolErrorHandler: (error) => {
        console.error("DB Pool Error", error)
    },
    namingStrategy: new SnakeNamingStrategy(),
    entities,
    subscribers: [
        FlagSubscriber,
    ],
    migrations: process.env.NODE_ENV === "migration" ? ["./migrations/pg/*.ts"] : []
}

const config = process.env.DATABASE_TYPE === "pg" ? pgConfig : sqliteConfig

export const AppDataSource = new DataSource(config)

export class Data {
    static async init(log: FastifyBaseLogger) {
        await AppDataSource.initialize().catch((err) => {
            log.error(`DB init error`, err)
            throw err
        })

        log.info("DB connected")

        if (process.env.DATABASE_TYPE === "SQLITE") {
            const queryRunner = AppDataSource.createQueryRunner()

            await queryRunner.query('PRAGMA journal_mode = WAL;');
            await queryRunner.query('PRAGMA synchronous = normal;');
            await queryRunner.query('PRAGMA temp_store = memory;');
            await queryRunner.query('PRAGMA mmap_size = 30000000000;');

            log.info("DB optimized")
        }
    }
}
