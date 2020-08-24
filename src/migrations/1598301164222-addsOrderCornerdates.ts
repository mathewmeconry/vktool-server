import {MigrationInterface, QueryRunner} from "typeorm";

export class addsOrderCornerdates1598301164222 implements MigrationInterface {
    name = 'addsOrderCornerdates1598301164222'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `order` ADD `firstExecDate` datetime NOT NULL");
        await queryRunner.query("ALTER TABLE `order` ADD `lastExecDate` datetime NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `order` DROP COLUMN `lastExecDate`");
        await queryRunner.query("ALTER TABLE `order` DROP COLUMN `firstExecDate`");
    }

}
