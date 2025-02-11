import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1739292667587 implements MigrationInterface {
    name = 'Initial1739292667587'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "settings" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "offset_days" integer)`);
        await queryRunner.query(`CREATE TABLE "constraint" ("id" varchar PRIMARY KEY NOT NULL, "description" varchar NOT NULL, "key" varchar NOT NULL, "values" text NOT NULL, CONSTRAINT "UQ_27768181fff255ce8ba90de4bb0" UNIQUE ("description"))`);
        await queryRunner.query(`CREATE TABLE "flag" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "is_on" boolean NOT NULL, "is_archived" boolean NOT NULL, "updated_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_4937d6ca2382a40ec24c24a73f7" UNIQUE ("name"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" varchar PRIMARY KEY NOT NULL, "email" varchar NOT NULL, "password" varchar NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"))`);
        await queryRunner.query(`CREATE TABLE "history" ("id" varchar PRIMARY KEY NOT NULL, "flag_id" varchar NOT NULL, "flag_name" varchar NOT NULL, "user_id" varchar NOT NULL, "user_email" varchar NOT NULL, "what" varchar NOT NULL, "constraint_id" varchar, "constraint_info" varchar, "when" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE INDEX "IDX_6bc2127d32e8fc611baa6a6fce" ON "history" ("flag_id") `);
        await queryRunner.query(`CREATE TABLE "flag_constraints_constraint" ("flag_id" varchar NOT NULL, "constraint_id" varchar NOT NULL, PRIMARY KEY ("flag_id", "constraint_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9579cbbbf3ad919010e91cad6d" ON "flag_constraints_constraint" ("flag_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_563d690c917a7c5cc1b6ae2e93" ON "flag_constraints_constraint" ("constraint_id") `);
        await queryRunner.query(`DROP INDEX "IDX_9579cbbbf3ad919010e91cad6d"`);
        await queryRunner.query(`DROP INDEX "IDX_563d690c917a7c5cc1b6ae2e93"`);
        await queryRunner.query(`CREATE TABLE "temporary_flag_constraints_constraint" ("flag_id" varchar NOT NULL, "constraint_id" varchar NOT NULL, CONSTRAINT "FK_9579cbbbf3ad919010e91cad6dd" FOREIGN KEY ("flag_id") REFERENCES "flag" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_563d690c917a7c5cc1b6ae2e93d" FOREIGN KEY ("constraint_id") REFERENCES "constraint" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("flag_id", "constraint_id"))`);
        await queryRunner.query(`INSERT INTO "temporary_flag_constraints_constraint"("flag_id", "constraint_id") SELECT "flag_id", "constraint_id" FROM "flag_constraints_constraint"`);
        await queryRunner.query(`DROP TABLE "flag_constraints_constraint"`);
        await queryRunner.query(`ALTER TABLE "temporary_flag_constraints_constraint" RENAME TO "flag_constraints_constraint"`);
        await queryRunner.query(`CREATE INDEX "IDX_9579cbbbf3ad919010e91cad6d" ON "flag_constraints_constraint" ("flag_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_563d690c917a7c5cc1b6ae2e93" ON "flag_constraints_constraint" ("constraint_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_563d690c917a7c5cc1b6ae2e93"`);
        await queryRunner.query(`DROP INDEX "IDX_9579cbbbf3ad919010e91cad6d"`);
        await queryRunner.query(`ALTER TABLE "flag_constraints_constraint" RENAME TO "temporary_flag_constraints_constraint"`);
        await queryRunner.query(`CREATE TABLE "flag_constraints_constraint" ("flag_id" varchar NOT NULL, "constraint_id" varchar NOT NULL, PRIMARY KEY ("flag_id", "constraint_id"))`);
        await queryRunner.query(`INSERT INTO "flag_constraints_constraint"("flag_id", "constraint_id") SELECT "flag_id", "constraint_id" FROM "temporary_flag_constraints_constraint"`);
        await queryRunner.query(`DROP TABLE "temporary_flag_constraints_constraint"`);
        await queryRunner.query(`CREATE INDEX "IDX_563d690c917a7c5cc1b6ae2e93" ON "flag_constraints_constraint" ("constraint_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_9579cbbbf3ad919010e91cad6d" ON "flag_constraints_constraint" ("flag_id") `);
        await queryRunner.query(`DROP INDEX "IDX_563d690c917a7c5cc1b6ae2e93"`);
        await queryRunner.query(`DROP INDEX "IDX_9579cbbbf3ad919010e91cad6d"`);
        await queryRunner.query(`DROP TABLE "flag_constraints_constraint"`);
        await queryRunner.query(`DROP INDEX "IDX_6bc2127d32e8fc611baa6a6fce"`);
        await queryRunner.query(`DROP TABLE "history"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "flag"`);
        await queryRunner.query(`DROP TABLE "constraint"`);
        await queryRunner.query(`DROP TABLE "settings"`);
    }

}
