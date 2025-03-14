import { DataSource } from "typeorm"
import Flag from "./entities/flag"
import { FastifyBaseLogger } from "fastify"
import { SnakeNamingStrategy } from "typeorm-naming-strategies"
import Constraint from "./entities/constraint"
import * as path from "upath"

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: path.join(process.env.DATA_FOLDER_PATH || "../../data", "plain-flags.sqlite"),
    logging: false,
    synchronize: false,
    namingStrategy: new SnakeNamingStrategy(),
    entities: [
        Flag,
        Constraint
    ],
})

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
