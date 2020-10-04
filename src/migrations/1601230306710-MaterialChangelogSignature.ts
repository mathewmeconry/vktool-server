import {MigrationInterface, QueryRunner} from "typeorm";

export class MaterialChangelogSignature1601230306710 implements MigrationInterface {
    name = 'MaterialChangelogSignature1601230306710'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `material_changelog` ADD `signature` longtext NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `material_changelog` DROP COLUMN `signature`");
    }

}
