import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedAtColumns1762014019932 implements MigrationInterface {
    name = 'CreatedAtColumns1762014019932'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_constraint" ("id" varchar PRIMARY KEY NOT NULL, "description" varchar NOT NULL, "key" varchar NOT NULL, "values" text NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_27768181fff255ce8ba90de4bb0" UNIQUE ("description"))`);
        await queryRunner.query(`INSERT INTO "temporary_constraint"("id", "description", "key", "values") SELECT "id", "description", "key", "values" FROM "constraint"`);
        await queryRunner.query(`DROP TABLE "constraint"`);
        await queryRunner.query(`ALTER TABLE "temporary_constraint" RENAME TO "constraint"`);
        await queryRunner.query(`CREATE TABLE "temporary_flag" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "is_on" boolean NOT NULL, "is_archived" boolean NOT NULL, "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "created_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_4937d6ca2382a40ec24c24a73f7" UNIQUE ("name"))`);
        await queryRunner.query(`INSERT INTO "temporary_flag"("id", "name", "is_on", "is_archived", "updated_at") SELECT "id", "name", "is_on", "is_archived", "updated_at" FROM "flag"`);
        await queryRunner.query(`DROP TABLE "flag"`);
        await queryRunner.query(`ALTER TABLE "temporary_flag" RENAME TO "flag"`);
        await queryRunner.query(`CREATE TABLE "temporary_user" ("id" varchar PRIMARY KEY NOT NULL, "email" varchar NOT NULL, "password" varchar NOT NULL, "role" varchar NOT NULL DEFAULT ('user'), "created_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"))`);
        await queryRunner.query(`INSERT INTO "temporary_user"("id", "email", "password", "role") SELECT "id", "email", "password", "role" FROM "user"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`);
        await queryRunner.query(`CREATE TABLE "user" ("id" varchar PRIMARY KEY NOT NULL, "email" varchar NOT NULL, "password" varchar NOT NULL, "role" varchar NOT NULL DEFAULT ('user'), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"))`);
        await queryRunner.query(`INSERT INTO "user"("id", "email", "password", "role") SELECT "id", "email", "password", "role" FROM "temporary_user"`);
        await queryRunner.query(`DROP TABLE "temporary_user"`);
        await queryRunner.query(`ALTER TABLE "flag" RENAME TO "temporary_flag"`);
        await queryRunner.query(`CREATE TABLE "flag" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "is_on" boolean NOT NULL, "is_archived" boolean NOT NULL, "updated_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_4937d6ca2382a40ec24c24a73f7" UNIQUE ("name"))`);
        await queryRunner.query(`INSERT INTO "flag"("id", "name", "is_on", "is_archived", "updated_at") SELECT "id", "name", "is_on", "is_archived", "updated_at" FROM "temporary_flag"`);
        await queryRunner.query(`DROP TABLE "temporary_flag"`);
        await queryRunner.query(`ALTER TABLE "constraint" RENAME TO "temporary_constraint"`);
        await queryRunner.query(`CREATE TABLE "constraint" ("id" varchar PRIMARY KEY NOT NULL, "description" varchar NOT NULL, "key" varchar NOT NULL, "values" text NOT NULL, CONSTRAINT "UQ_27768181fff255ce8ba90de4bb0" UNIQUE ("description"))`);
        await queryRunner.query(`INSERT INTO "constraint"("id", "description", "key", "values") SELECT "id", "description", "key", "values" FROM "temporary_constraint"`);
        await queryRunner.query(`DROP TABLE "temporary_constraint"`);
    }

}
