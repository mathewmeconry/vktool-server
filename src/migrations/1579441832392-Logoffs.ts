import { MigrationInterface, QueryRunner } from 'typeorm';

export class Logoffs1579441832392 implements MigrationInterface {
	name = 'Logoffs1579441832392';

	public async up(queryRunner: QueryRunner): Promise<any> {
		await queryRunner.query(
			'CREATE TABLE `logoff` (`id` int NOT NULL AUTO_INCREMENT, `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6), `from` datetime(6) NOT NULL, `until` datetime(6) NOT NULL, `state` text NOT NULL, `remarks` text NULL, `deletedAt` date NULL, `contactId` int NULL, `createdById` int NULL, `changedStateById` int NULL, `deletedById` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
			undefined
		);
		await queryRunner.query(
			'ALTER TABLE `compensation` CHANGE `dayHours` `dayHours` float NULL',
			undefined
		);
		await queryRunner.query(
			'ALTER TABLE `compensation` CHANGE `nightHours` `nightHours` float NULL',
			undefined
		);
		await queryRunner.query(
			'ALTER TABLE `user` CHANGE `lastLogin` `lastLogin` timestamp(6) NOT NULL',
			undefined
		);
		await queryRunner.query(
			'ALTER TABLE `logoff` ADD CONSTRAINT `FK_0f316bb0f7928e5be996764c70e` FOREIGN KEY (`contactId`) REFERENCES `contact`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
			undefined
		);
		await queryRunner.query(
			'ALTER TABLE `logoff` ADD CONSTRAINT `FK_9384163127372c9910306496119` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
			undefined
		);
		await queryRunner.query(
			'ALTER TABLE `logoff` ADD CONSTRAINT `FK_249cab0775470a2a8d05cf085c8` FOREIGN KEY (`changedStateById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
			undefined
		);
		await queryRunner.query(
			'ALTER TABLE `logoff` ADD CONSTRAINT `FK_f80863bc293efb7a9b1e4932a57` FOREIGN KEY (`deletedById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
			undefined
		);
	}

	public async down(queryRunner: QueryRunner): Promise<any> {
		await queryRunner.query(
			'ALTER TABLE `logoff` DROP FOREIGN KEY `FK_f80863bc293efb7a9b1e4932a57`',
			undefined
		);
		await queryRunner.query(
			'ALTER TABLE `logoff` DROP FOREIGN KEY `FK_249cab0775470a2a8d05cf085c8`',
			undefined
		);
		await queryRunner.query(
			'ALTER TABLE `logoff` DROP FOREIGN KEY `FK_9384163127372c9910306496119`',
			undefined
		);
		await queryRunner.query(
			'ALTER TABLE `logoff` DROP FOREIGN KEY `FK_0f316bb0f7928e5be996764c70e`',
			undefined
		);
		await queryRunner.query(
			"ALTER TABLE `user` CHANGE `lastLogin` `lastLogin` timestamp(6) NOT NULL DEFAULT '0000-00-00 00:00:00.000000'",
			undefined
		);
		await queryRunner.query(
			'ALTER TABLE `compensation` CHANGE `nightHours` `nightHours` float(12) NULL',
			undefined
		);
		await queryRunner.query(
			'ALTER TABLE `compensation` CHANGE `dayHours` `dayHours` float(12) NULL',
			undefined
		);
		await queryRunner.query('DROP TABLE `logoff`', undefined);
	}
}
