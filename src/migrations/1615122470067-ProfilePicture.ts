import {MigrationInterface, QueryRunner} from "typeorm";

export class ProfilePicture1615122470067 implements MigrationInterface {
    name = 'ProfilePicture1615122470067'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `contact` ADD `profilePicture` longtext NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `contact` DROP COLUMN `profilePicture`");
    }

}
