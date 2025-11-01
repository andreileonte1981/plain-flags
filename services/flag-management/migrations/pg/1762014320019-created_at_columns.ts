import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedAtColumns1762014320019 implements MigrationInterface {
    name = 'CreatedAtColumns1762014320019'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "constraint" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "flag" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "flag" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "constraint" DROP COLUMN "created_at"`);
    }

}
