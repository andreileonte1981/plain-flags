import { DataSource } from "typeorm"
import Flag from "./entities/flag"
import { FastifyBaseLogger } from "fastify"
import { SnakeNamingStrategy } from "typeorm-naming-strategies"
import Constraint from "./entities/constraint"

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "../../data/plain-flags.sqlite",     // TODO: allow users to configure this
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
