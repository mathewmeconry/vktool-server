import {MigrationInterface, QueryRunner} from "typeorm";

export class MaterialChangelogFiles1600984229260 implements MigrationInterface {
    name = 'MaterialChangelogFiles1600984229260'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `material_changelog` ADD `files` longtext NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `material_changelog` DROP COLUMN `files`");
    }

}
