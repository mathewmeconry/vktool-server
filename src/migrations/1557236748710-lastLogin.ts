import { MigrationInterface, QueryRunner } from 'typeorm';

export class lastLogin1557236748710 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<any> {
		await queryRunner.query('ALTER TABLE `user` ADD `lastLogin` timestamp(6) NOT NULL');
		await queryRunner.query(
			'ALTER TABLE `payout` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)'
		);
		await queryRunner.query(
			'ALTER TABLE `compensation` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)'
		);
		await queryRunner.query('ALTER TABLE `compensation` CHANGE `dayHours` `dayHours` float NULL');
		await queryRunner.query(
			'ALTER TABLE `compensation` CHANGE `nightHours` `nightHours` float NULL'
		);
		await queryRunner.query(
			'ALTER TABLE `contact_type` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)'
		);
		await queryRunner.query(
			'ALTER TABLE `contact_group` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)'
		);
		await queryRunner.query(
			'ALTER TABLE `collection_point` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)'
		);
		await queryRunner.query(
			'ALTER TABLE `contact_extension` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)'
		);
		await queryRunner.query(
			'ALTER TABLE `contact` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)'
		);
		await queryRunner.query(
			'ALTER TABLE `user` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)'
		);
		await queryRunner.query(
			'ALTER TABLE `position` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)'
		);
		await queryRunner.query(
			'ALTER TABLE `order` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)'
		);
		await queryRunner.query(
			'ALTER TABLE `billing_report` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)'
		);
	}

	public async down(queryRunner: QueryRunner): Promise<any> {
		await queryRunner.query(
			"ALTER TABLE `billing_report` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'"
		);
		await queryRunner.query(
			"ALTER TABLE `order` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'"
		);
		await queryRunner.query(
			"ALTER TABLE `position` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'"
		);
		await queryRunner.query(
			"ALTER TABLE `user` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'"
		);
		await queryRunner.query(
			"ALTER TABLE `contact` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'"
		);
		await queryRunner.query(
			"ALTER TABLE `contact_extension` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'"
		);
		await queryRunner.query(
			"ALTER TABLE `collection_point` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'"
		);
		await queryRunner.query(
			"ALTER TABLE `contact_group` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'"
		);
		await queryRunner.query(
			"ALTER TABLE `contact_type` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'"
		);
		await queryRunner.query(
			'ALTER TABLE `compensation` CHANGE `nightHours` `nightHours` float(12) NULL'
		);
		await queryRunner.query(
			'ALTER TABLE `compensation` CHANGE `dayHours` `dayHours` float(12) NULL'
		);
		await queryRunner.query(
			"ALTER TABLE `compensation` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'"
		);
		await queryRunner.query(
			"ALTER TABLE `payout` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'"
		);
		await queryRunner.query('ALTER TABLE `user` DROP COLUMN `lastLogin`');
	}
}
