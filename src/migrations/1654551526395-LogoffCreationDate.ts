import {MigrationInterface, QueryRunner} from "typeorm";

export class LogoffCreationDate1654551526395 implements MigrationInterface {
    name = 'LogoffCreationDate1654551526395'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `logoff` ADD `createdAt` datetime(6) NULL");
   }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `logoff` DROP COLUMN `createdAt`");
    }

}
