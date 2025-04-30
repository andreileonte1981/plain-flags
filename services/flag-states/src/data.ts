import { DataSource } from "typeorm"
import Flag from "./entities/flag"
import { FastifyBaseLogger } from "fastify"
import { SnakeNamingStrategy } from "typeorm-naming-strategies"
import Constraint from "./entities/constraint"
import * as path from "upath"
import * as fs from "fs"
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions"
import { BetterSqlite3ConnectionOptions } from "typeorm/driver/better-sqlite3/BetterSqlite3ConnectionOptions"

const entities = [
    Flag, Constraint
]

const sqliteConfig: BetterSqlite3ConnectionOptions = {
    type: "better-sqlite3",
    database: path.join(process.env.DATA_FOLDER_PATH || "../../data", "plain-flags.sqlite"),
    logging: true,
    synchronize: false,
    namingStrategy: new SnakeNamingStrategy(),
    entities
}

const pwdPath = process.env.DATABASE_PASSWORD_FILE
let password = process.env.DATABASE_PASSWORD || "password"

if (pwdPath) {
    const pwdFromFile = fs.readFileSync(pwdPath)
    password = pwdFromFile.toString()
}

const pgConfig: PostgresConnectionOptions = {
    type: "postgres",
    host: process.env.DATABASE_HOST,
    port: +(process.env.DATABASE_PORT || 5432),
    database: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USER,
    password,
    logging: false,
    synchronize: false,
    poolSize: +(process.env.DATABASE_POOL_SIZE || 64),
    connectTimeoutMS: 15000,
    poolErrorHandler: (error) => {
        console.error("DB Pool Error", error)
    },
    namingStrategy: new SnakeNamingStrategy(),
    entities
}

const config = process.env.DATABASE_TYPE === "pg" ? pgConfig : sqliteConfig

export const AppDataSource = new DataSource(config)

export class Data {
    static async init(log: FastifyBaseLogger) {
        let nAttempts = 10;
        const waitFor = 5000;

        while (nAttempts) {
            nAttempts--;

            try {
                await AppDataSource.initialize().catch((err) => {
                    log.error(`DB init error`, err)
                    throw err
                })

                log.info("DB connected")

                nAttempts = 0
            }
            catch (e) {
                console.log(`Problems initializing database connection`)
                console.log(e)

                if (nAttempts) {
                    console.log(`Retrying... ${nAttempts} attempts left.`)

                    await sleep(waitFor)
                }
                else {
                    throw e
                }
            }
        }
    }
}

async function sleep(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
