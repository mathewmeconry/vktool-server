import { MigrationInterface, QueryRunner } from 'typeorm';

export class newAccountingFields1555163604118 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<any> {
		await queryRunner.query('ALTER TABLE `contact_extension` ADD `bankName` text NULL');
		await queryRunner.query('ALTER TABLE `contact_extension` ADD `iban` text NULL');
		await queryRunner.query('ALTER TABLE `contact_extension` ADD `accountHolder` text NULL');
	}

	public async down(queryRunner: QueryRunner): Promise<any> {
		await queryRunner.query('ALTER TABLE `contact_extension` DROP COLUMN `accountHolder`');
		await queryRunner.query('ALTER TABLE `contact_extension` DROP COLUMN `iban`');
		await queryRunner.query('ALTER TABLE `contact_extension` DROP COLUMN `bankName`');
	}
}
