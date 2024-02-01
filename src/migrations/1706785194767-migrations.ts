import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1706785194767 implements MigrationInterface {
    name = 'Migrations1706785194767'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "affiliate" DROP COLUMN "basePrice"`);
        await queryRunner.query(`ALTER TABLE "affiliate" ADD "basePrice" numeric(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "affiliate" DROP COLUMN "discountPrice"`);
        await queryRunner.query(`ALTER TABLE "affiliate" ADD "discountPrice" numeric(10,2) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "affiliate" DROP COLUMN "discountPrice"`);
        await queryRunner.query(`ALTER TABLE "affiliate" ADD "discountPrice" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "affiliate" DROP COLUMN "basePrice"`);
        await queryRunner.query(`ALTER TABLE "affiliate" ADD "basePrice" integer NOT NULL`);
    }

}
