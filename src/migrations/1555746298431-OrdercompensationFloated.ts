import {MigrationInterface, QueryRunner} from "typeorm";

export class OrdercompensationFloated1555746298431 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `compensation` DROP COLUMN `dayHours`");
        await queryRunner.query("ALTER TABLE `compensation` ADD `dayHours` float NULL");
        await queryRunner.query("ALTER TABLE `compensation` DROP COLUMN `nightHours`");
        await queryRunner.query("ALTER TABLE `compensation` ADD `nightHours` float NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `compensation` DROP COLUMN `nightHours`");
        await queryRunner.query("ALTER TABLE `compensation` ADD `nightHours` int NULL DEFAULT '0'");
        await queryRunner.query("ALTER TABLE `compensation` DROP COLUMN `dayHours`");
        await queryRunner.query("ALTER TABLE `compensation` ADD `dayHours` int NULL DEFAULT '0'");
    }

}
