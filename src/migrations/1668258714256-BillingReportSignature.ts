import { MigrationInterface, QueryRunner } from 'typeorm';

export class BillingReportSignature1668258714256 implements MigrationInterface {
	name = 'BillingReportSignature1668258714256';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('ALTER TABLE `billing_report` ADD `signature` longtext NULL');
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('ALTER TABLE `billing_report` DROP COLUMN `signature`');
	}
}
