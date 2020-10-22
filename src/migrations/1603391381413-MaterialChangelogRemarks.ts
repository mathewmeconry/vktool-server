import {MigrationInterface, QueryRunner} from "typeorm";

export class MaterialChangelogRemarks1603391381413 implements MigrationInterface {
    name = 'MaterialChangelogRemarks1603391381413'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `material_changelog` ADD `remarks` longtext NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `material_changelog` DROP COLUMN `remarks`");
    }

}
