import {MigrationInterface, QueryRunner} from "typeorm";

export class Logoff21578953813787 implements MigrationInterface {
    name = 'Logoff21578953813787'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `logoff` ADD `approved` tinyint NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `logoff` ADD `remarks` text NULL", undefined);
        await queryRunner.query("ALTER TABLE `compensation` CHANGE `dayHours` `dayHours` float NULL", undefined);
        await queryRunner.query("ALTER TABLE `compensation` CHANGE `nightHours` `nightHours` float NULL", undefined);
        await queryRunner.query("ALTER TABLE `user` CHANGE `lastLogin` `lastLogin` timestamp(6) NOT NULL", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `lastLogin` `lastLogin` timestamp(6) NOT NULL DEFAULT '0000-00-00 00:00:00.000000'", undefined);
        await queryRunner.query("ALTER TABLE `compensation` CHANGE `nightHours` `nightHours` float(12) NULL", undefined);
        await queryRunner.query("ALTER TABLE `compensation` CHANGE `dayHours` `dayHours` float(12) NULL", undefined);
        await queryRunner.query("ALTER TABLE `logoff` DROP COLUMN `remarks`", undefined);
        await queryRunner.query("ALTER TABLE `logoff` DROP COLUMN `approved`", undefined);
    }

}
