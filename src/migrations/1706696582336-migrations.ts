import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1706696582336 implements MigrationInterface {
    name = 'Migrations1706696582336'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "media" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "url" character varying NOT NULL, "localPath" character varying NOT NULL DEFAULT '', "filename" character varying NOT NULL DEFAULT '', "type" character varying NOT NULL, "size" integer NOT NULL, CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "affiliate" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "url" character varying NOT NULL, "animals" text NOT NULL, "description" character varying, "title" character varying NOT NULL, "brand" character varying NOT NULL, "basePrice" integer NOT NULL, "discountPrice" integer NOT NULL, "imageId" uuid, CONSTRAINT "REL_1a1bcc874524709a921762a753" UNIQUE ("imageId"), CONSTRAINT "PK_1ce9ae335b25b11224e2756cfdc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "animal" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "bornDate" TIMESTAMP NOT NULL, "gender" character varying NOT NULL, "type" character varying NOT NULL, "status" character varying NOT NULL, "houseId" uuid, CONSTRAINT "PK_af42b1374c042fb3fa2251f9f42" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "recurrence" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "date" TIMESTAMP NOT NULL, "type" character varying NOT NULL, CONSTRAINT "PK_47b87ac66b63dd3f1cfa1674240" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "task" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "description" character varying, "status" character varying NOT NULL, "message" character varying, "date" TIMESTAMP NOT NULL, "isArchived" boolean NOT NULL DEFAULT false, "pictureId" uuid, "recurrenceId" uuid, CONSTRAINT "REL_7f3ff9d9ab33a8c22d1f272f50" UNIQUE ("pictureId"), CONSTRAINT "REL_1c095009963518acde13d00c29" UNIQUE ("recurrenceId"), CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "firstName" character varying NOT NULL, "lastName" character varying, "email" character varying, "password" character varying, "role" character varying NOT NULL, "isAdmin" boolean NOT NULL DEFAULT false, "profilePictureId" uuid, "houseId" uuid, CONSTRAINT "REL_f58f9c73bc58e409038e56a405" UNIQUE ("profilePictureId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "join_code" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "code" character varying NOT NULL, "expirationDate" TIMESTAMP NOT NULL, "type" character varying NOT NULL, "houseId" uuid, CONSTRAINT "REL_1b0db6a184733f374840e0db5b" UNIQUE ("houseId"), CONSTRAINT "PK_e25150b170bb477fedb76a5928c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "billing_plan" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "description" character varying NOT NULL, "price" double precision NOT NULL, "type" character varying NOT NULL, CONSTRAINT "PK_63f4db8ca9063690ab4dfc3b3da" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "house" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "joinCodeId" uuid, "billingPlanId" uuid, CONSTRAINT "REL_b038a881d99f3e6242cc3da76a" UNIQUE ("joinCodeId"), CONSTRAINT "PK_8c9220195fd0a289745855fe908" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "task_users_user" ("taskId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_47c41ed85b67f33ecf6c990e550" PRIMARY KEY ("taskId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cb749a4b0103a3bc2235beafc9" ON "task_users_user" ("taskId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a70c8dbe2f96b5ed1bc4df33a4" ON "task_users_user" ("userId") `);
        await queryRunner.query(`CREATE TABLE "task_animals_animal" ("taskId" uuid NOT NULL, "animalId" uuid NOT NULL, CONSTRAINT "PK_4d4d6914429257b8c9917cdbe3b" PRIMARY KEY ("taskId", "animalId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4bacab16c64993631e03ecc4b5" ON "task_animals_animal" ("taskId") `);
        await queryRunner.query(`CREATE INDEX "IDX_6a0c50e2e56ab60f38c7ec41d7" ON "task_animals_animal" ("animalId") `);
        await queryRunner.query(`ALTER TABLE "affiliate" ADD CONSTRAINT "FK_1a1bcc874524709a921762a7530" FOREIGN KEY ("imageId") REFERENCES "media"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "animal" ADD CONSTRAINT "FK_92b3f80b5670d77d270b826f315" FOREIGN KEY ("houseId") REFERENCES "house"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_7f3ff9d9ab33a8c22d1f272f50c" FOREIGN KEY ("pictureId") REFERENCES "media"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_1c095009963518acde13d00c297" FOREIGN KEY ("recurrenceId") REFERENCES "recurrence"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_f58f9c73bc58e409038e56a4055" FOREIGN KEY ("profilePictureId") REFERENCES "media"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_f69ba1778a2af87e66da5f30346" FOREIGN KEY ("houseId") REFERENCES "house"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "join_code" ADD CONSTRAINT "FK_1b0db6a184733f374840e0db5bd" FOREIGN KEY ("houseId") REFERENCES "house"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "house" ADD CONSTRAINT "FK_b038a881d99f3e6242cc3da76ae" FOREIGN KEY ("joinCodeId") REFERENCES "join_code"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "house" ADD CONSTRAINT "FK_72f457d5ecbaa3040a7e68640df" FOREIGN KEY ("billingPlanId") REFERENCES "billing_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_users_user" ADD CONSTRAINT "FK_cb749a4b0103a3bc2235beafc94" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "task_users_user" ADD CONSTRAINT "FK_a70c8dbe2f96b5ed1bc4df33a4f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_animals_animal" ADD CONSTRAINT "FK_4bacab16c64993631e03ecc4b57" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "task_animals_animal" ADD CONSTRAINT "FK_6a0c50e2e56ab60f38c7ec41d72" FOREIGN KEY ("animalId") REFERENCES "animal"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_animals_animal" DROP CONSTRAINT "FK_6a0c50e2e56ab60f38c7ec41d72"`);
        await queryRunner.query(`ALTER TABLE "task_animals_animal" DROP CONSTRAINT "FK_4bacab16c64993631e03ecc4b57"`);
        await queryRunner.query(`ALTER TABLE "task_users_user" DROP CONSTRAINT "FK_a70c8dbe2f96b5ed1bc4df33a4f"`);
        await queryRunner.query(`ALTER TABLE "task_users_user" DROP CONSTRAINT "FK_cb749a4b0103a3bc2235beafc94"`);
        await queryRunner.query(`ALTER TABLE "house" DROP CONSTRAINT "FK_72f457d5ecbaa3040a7e68640df"`);
        await queryRunner.query(`ALTER TABLE "house" DROP CONSTRAINT "FK_b038a881d99f3e6242cc3da76ae"`);
        await queryRunner.query(`ALTER TABLE "join_code" DROP CONSTRAINT "FK_1b0db6a184733f374840e0db5bd"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_f69ba1778a2af87e66da5f30346"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_f58f9c73bc58e409038e56a4055"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_1c095009963518acde13d00c297"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_7f3ff9d9ab33a8c22d1f272f50c"`);
        await queryRunner.query(`ALTER TABLE "animal" DROP CONSTRAINT "FK_92b3f80b5670d77d270b826f315"`);
        await queryRunner.query(`ALTER TABLE "affiliate" DROP CONSTRAINT "FK_1a1bcc874524709a921762a7530"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6a0c50e2e56ab60f38c7ec41d7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4bacab16c64993631e03ecc4b5"`);
        await queryRunner.query(`DROP TABLE "task_animals_animal"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a70c8dbe2f96b5ed1bc4df33a4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cb749a4b0103a3bc2235beafc9"`);
        await queryRunner.query(`DROP TABLE "task_users_user"`);
        await queryRunner.query(`DROP TABLE "house"`);
        await queryRunner.query(`DROP TABLE "billing_plan"`);
        await queryRunner.query(`DROP TABLE "join_code"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "task"`);
        await queryRunner.query(`DROP TABLE "recurrence"`);
        await queryRunner.query(`DROP TABLE "animal"`);
        await queryRunner.query(`DROP TABLE "affiliate"`);
        await queryRunner.query(`DROP TABLE "media"`);
    }

}
