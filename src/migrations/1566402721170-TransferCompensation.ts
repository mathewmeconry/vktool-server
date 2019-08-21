import {MigrationInterface, QueryRunner} from "typeorm";

export class TransferCompensation1566402721170 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `compensation` ADD `transferCompensationId` int NULL");
        await queryRunner.query("ALTER TABLE `payout` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `compensation` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `compensation` CHANGE `dayHours` `dayHours` float NULL");
        await queryRunner.query("ALTER TABLE `compensation` CHANGE `nightHours` `nightHours` float NULL");
        await queryRunner.query("ALTER TABLE `contact_type` CHANGE `updatedAt`  `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `contact_group` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `collection_point` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `contact_extension` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `contact` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `user` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `user` CHANGE `lastLogin` `lastLogin` timestamp(6) NOT NULL");
        await queryRunner.query("ALTER TABLE `position` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `order` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `billing_report` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `compensation` ADD CONSTRAINT `FK_7f193f4248bc7ef48a77f7a6e5c` FOREIGN KEY (`transferCompensationId`) REFERENCES `compensation`(`id`)");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `compensation` DROP FOREIGN KEY `FK_7f193f4248bc7ef48a77f7a6e5c`");
        await queryRunner.query("ALTER TABLE `billing_report` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
        await queryRunner.query("ALTER TABLE `order` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
        await queryRunner.query("ALTER TABLE `position` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
        await queryRunner.query("ALTER TABLE `user` CHANGE `lastLogin` `lastLogin` timestamp(6) NOT NULL DEFAULT ''0000-00-00 00:00:00.000000''");
        await queryRunner.query("ALTER TABLE `user` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
        await queryRunner.query("ALTER TABLE `contact` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
        await queryRunner.query("ALTER TABLE `contact_extension` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
        await queryRunner.query("ALTER TABLE `collection_point` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
        await queryRunner.query("ALTER TABLE `contact_group` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
        await queryRunner.query("ALTER TABLE `contact_type` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
        await queryRunner.query("ALTER TABLE `compensation` CHANGE `nightHours` `nightHours` float(12) NULL");
        await queryRunner.query("ALTER TABLE `compensation` CHANGE `dayHours` `dayHours` float(12) NULL");
        await queryRunner.query("ALTER TABLE `compensation` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
        await queryRunner.query("ALTER TABLE `payout` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
        await queryRunner.query("ALTER TABLE `compensation` DROP COLUMN `transferCompensationId`");
    }

}
