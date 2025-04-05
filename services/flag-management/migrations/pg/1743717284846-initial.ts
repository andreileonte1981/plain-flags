import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1743717284846 implements MigrationInterface {
    name = 'Initial1743717284846'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "settings" ("id" SERIAL NOT NULL, "offset_days" integer, CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "constraint" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" character varying NOT NULL, "key" character varying NOT NULL, "values" text NOT NULL, CONSTRAINT "UQ_27768181fff255ce8ba90de4bb0" UNIQUE ("description"), CONSTRAINT "PK_2f009186bc404785fec59ef08a9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "flag" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "is_on" boolean NOT NULL, "is_archived" boolean NOT NULL, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4937d6ca2382a40ec24c24a73f7" UNIQUE ("name"), CONSTRAINT "PK_17b74257294fdfd221178a132d4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'user', CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "flag_id" character varying NOT NULL, "flag_name" character varying NOT NULL, "user_id" character varying NOT NULL, "user_email" character varying NOT NULL, "what" character varying NOT NULL, "constraint_id" character varying, "constraint_info" character varying, "when" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9384942edf4804b38ca0ee51416" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6bc2127d32e8fc611baa6a6fce" ON "history" ("flag_id") `);
        await queryRunner.query(`CREATE TABLE "flag_constraints_constraint" ("flag_id" uuid NOT NULL, "constraint_id" uuid NOT NULL, CONSTRAINT "PK_fe4502c4f57e31fe05cc1746df5" PRIMARY KEY ("flag_id", "constraint_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9579cbbbf3ad919010e91cad6d" ON "flag_constraints_constraint" ("flag_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_563d690c917a7c5cc1b6ae2e93" ON "flag_constraints_constraint" ("constraint_id") `);
        await queryRunner.query(`ALTER TABLE "flag_constraints_constraint" ADD CONSTRAINT "FK_9579cbbbf3ad919010e91cad6dd" FOREIGN KEY ("flag_id") REFERENCES "flag"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "flag_constraints_constraint" ADD CONSTRAINT "FK_563d690c917a7c5cc1b6ae2e93d" FOREIGN KEY ("constraint_id") REFERENCES "constraint"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "flag_constraints_constraint" DROP CONSTRAINT "FK_563d690c917a7c5cc1b6ae2e93d"`);
        await queryRunner.query(`ALTER TABLE "flag_constraints_constraint" DROP CONSTRAINT "FK_9579cbbbf3ad919010e91cad6dd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_563d690c917a7c5cc1b6ae2e93"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9579cbbbf3ad919010e91cad6d"`);
        await queryRunner.query(`DROP TABLE "flag_constraints_constraint"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6bc2127d32e8fc611baa6a6fce"`);
        await queryRunner.query(`DROP TABLE "history"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "flag"`);
        await queryRunner.query(`DROP TABLE "constraint"`);
        await queryRunner.query(`DROP TABLE "settings"`);
    }

}
