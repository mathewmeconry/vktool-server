import {MigrationInterface, QueryRunner} from "typeorm";

export class contactExtensionLink1590749451361 implements MigrationInterface {
    name = 'contactExtensionLink1590749451361'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `payout` DROP FOREIGN KEY `FK_876e91c2b7fe7c3754d27f93925`");
        await queryRunner.query("ALTER TABLE `compensation` DROP FOREIGN KEY `FK_2ed520d194809163bd48bb2a904`");
        await queryRunner.query("ALTER TABLE `compensation` DROP FOREIGN KEY `FK_407f0779ad648ef055d5e0ea1ca`");
        await queryRunner.query("ALTER TABLE `compensation` DROP FOREIGN KEY `FK_5323a5e31b3ad735bb32c0b0a18`");
        await queryRunner.query("ALTER TABLE `compensation` DROP FOREIGN KEY `FK_58f23f5397e5157cf72240d992e`");
        await queryRunner.query("ALTER TABLE `compensation` DROP FOREIGN KEY `FK_7f193f4248bc7ef48a77f7a6e5c`");
        await queryRunner.query("ALTER TABLE `compensation` DROP FOREIGN KEY `FK_94024c01a701188f680561a2dcf`");
        await queryRunner.query("ALTER TABLE `compensation` DROP FOREIGN KEY `FK_ceedcb3d9d599a5890f175074d5`");
        await queryRunner.query("ALTER TABLE `compensation` DROP FOREIGN KEY `FK_ea606547e5d5246302f8c714da9`");
        await queryRunner.query("ALTER TABLE `contact_extension` DROP FOREIGN KEY `FK_674fec05583d50761a99d7a7bab`");
        await queryRunner.query("ALTER TABLE `contact_extension` DROP FOREIGN KEY `FK_806254a82ee6371fe241c0ee16a`");
        await queryRunner.query("ALTER TABLE `contact_extension` DROP FOREIGN KEY `FK_91608ced3678df19fe6480ab723`");
        await queryRunner.query("ALTER TABLE `contact` DROP FOREIGN KEY `FK_48157734434a60a92c5d35ce4d8`");
        await queryRunner.query("ALTER TABLE `user` DROP FOREIGN KEY `FK_ac138d90419beda4e06a0477a68`");
        await queryRunner.query("ALTER TABLE `position` DROP FOREIGN KEY `FK_8a8517acfb74f39261e539bc508`");
        await queryRunner.query("ALTER TABLE `order` DROP FOREIGN KEY `FK_88a7cef913aee3fd9ac590a2845`");
        await queryRunner.query("ALTER TABLE `billing_report` DROP FOREIGN KEY `FK_165649b6b3e33605f0869ae07dc`");
        await queryRunner.query("ALTER TABLE `billing_report` DROP FOREIGN KEY `FK_54492479441ad4214d126ff1093`");
        await queryRunner.query("ALTER TABLE `billing_report` DROP FOREIGN KEY `FK_d247f4450224d7da76b1c667242`");
        await queryRunner.query("ALTER TABLE `billing_report` DROP FOREIGN KEY `FK_f04f63d9092daa3249bdec810f7`");
        await queryRunner.query("ALTER TABLE `contact_contact_groups_contact_group` DROP FOREIGN KEY `FK_64e50efc14e7529c3f9076b7833`");
        await queryRunner.query("ALTER TABLE `contact_contact_groups_contact_group` DROP FOREIGN KEY `FK_e2d2630651d62e3cb3800ed7af6`");
        await queryRunner.query("ALTER TABLE `billing_report_els_contact` DROP FOREIGN KEY `FK_1f55d12708e33de69c090f73994`");
        await queryRunner.query("ALTER TABLE `billing_report_els_contact` DROP FOREIGN KEY `FK_bc80b504be0a7cf942c843e724d`");
        await queryRunner.query("ALTER TABLE `billing_report_drivers_contact` DROP FOREIGN KEY `FK_3901c8f9f43da25ce0b0fd8c746`");
        await queryRunner.query("ALTER TABLE `billing_report_drivers_contact` DROP FOREIGN KEY `FK_6a0d049fa13de162e2c5ab2a489`");
        await queryRunner.query("CREATE INDEX `IDX_e2d2630651d62e3cb3800ed7af` ON `contact_contact_groups_contact_group` (`contactId`)");
        await queryRunner.query("CREATE INDEX `IDX_64e50efc14e7529c3f9076b783` ON `contact_contact_groups_contact_group` (`contactGroupId`)");
        await queryRunner.query("CREATE INDEX `IDX_1f55d12708e33de69c090f7399` ON `billing_report_els_contact` (`billingReportId`)");
        await queryRunner.query("CREATE INDEX `IDX_bc80b504be0a7cf942c843e724` ON `billing_report_els_contact` (`contactId`)");
        await queryRunner.query("CREATE INDEX `IDX_6a0d049fa13de162e2c5ab2a48` ON `billing_report_drivers_contact` (`billingReportId`)");
        await queryRunner.query("CREATE INDEX `IDX_3901c8f9f43da25ce0b0fd8c74` ON `billing_report_drivers_contact` (`contactId`)");
        await queryRunner.query("ALTER TABLE `payout` ADD CONSTRAINT `FK_876e91c2b7fe7c3754d27f93925` FOREIGN KEY (`updatedById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `compensation` ADD CONSTRAINT `FK_58f23f5397e5157cf72240d992e` FOREIGN KEY (`memberId`) REFERENCES `contact`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `compensation` ADD CONSTRAINT `FK_ea606547e5d5246302f8c714da9` FOREIGN KEY (`creatorId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `compensation` ADD CONSTRAINT `FK_ceedcb3d9d599a5890f175074d5` FOREIGN KEY (`approvedById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `compensation` ADD CONSTRAINT `FK_2ed520d194809163bd48bb2a904` FOREIGN KEY (`payoutId`) REFERENCES `payout`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `compensation` ADD CONSTRAINT `FK_7f193f4248bc7ef48a77f7a6e5c` FOREIGN KEY (`transferCompensationId`) REFERENCES `compensation`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `compensation` ADD CONSTRAINT `FK_94024c01a701188f680561a2dcf` FOREIGN KEY (`updatedById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `compensation` ADD CONSTRAINT `FK_407f0779ad648ef055d5e0ea1ca` FOREIGN KEY (`deletedById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `compensation` ADD CONSTRAINT `FK_5323a5e31b3ad735bb32c0b0a18` FOREIGN KEY (`billingReportId`) REFERENCES `billing_report`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `contact_extension` ADD CONSTRAINT `FK_91608ced3678df19fe6480ab723` FOREIGN KEY (`contactId`) REFERENCES `contact`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `contact_extension` ADD CONSTRAINT `FK_674fec05583d50761a99d7a7bab` FOREIGN KEY (`collectionPointId`) REFERENCES `collection_point`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `contact_extension` ADD CONSTRAINT `FK_806254a82ee6371fe241c0ee16a` FOREIGN KEY (`updatedById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `contact` ADD CONSTRAINT `FK_48157734434a60a92c5d35ce4d8` FOREIGN KEY (`contactTypeId`) REFERENCES `contact_type`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user` ADD CONSTRAINT `FK_ac138d90419beda4e06a0477a68` FOREIGN KEY (`bexioContactId`) REFERENCES `contact`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `position` ADD CONSTRAINT `FK_8a8517acfb74f39261e539bc508` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `order` ADD CONSTRAINT `FK_88a7cef913aee3fd9ac590a2845` FOREIGN KEY (`contactId`) REFERENCES `contact`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `billing_report` ADD CONSTRAINT `FK_f04f63d9092daa3249bdec810f7` FOREIGN KEY (`creatorId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `billing_report` ADD CONSTRAINT `FK_165649b6b3e33605f0869ae07dc` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `billing_report` ADD CONSTRAINT `FK_54492479441ad4214d126ff1093` FOREIGN KEY (`approvedById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `billing_report` ADD CONSTRAINT `FK_d247f4450224d7da76b1c667242` FOREIGN KEY (`updatedById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `contact_contact_groups_contact_group` ADD CONSTRAINT `FK_e2d2630651d62e3cb3800ed7af6` FOREIGN KEY (`contactId`) REFERENCES `contact`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `contact_contact_groups_contact_group` ADD CONSTRAINT `FK_64e50efc14e7529c3f9076b7833` FOREIGN KEY (`contactGroupId`) REFERENCES `contact_group`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `billing_report_els_contact` ADD CONSTRAINT `FK_1f55d12708e33de69c090f73994` FOREIGN KEY (`billingReportId`) REFERENCES `billing_report`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `billing_report_els_contact` ADD CONSTRAINT `FK_bc80b504be0a7cf942c843e724d` FOREIGN KEY (`contactId`) REFERENCES `contact`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `billing_report_drivers_contact` ADD CONSTRAINT `FK_6a0d049fa13de162e2c5ab2a489` FOREIGN KEY (`billingReportId`) REFERENCES `billing_report`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `billing_report_drivers_contact` ADD CONSTRAINT `FK_3901c8f9f43da25ce0b0fd8c746` FOREIGN KEY (`contactId`) REFERENCES `contact`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `billing_report_drivers_contact` DROP FOREIGN KEY `FK_3901c8f9f43da25ce0b0fd8c746`");
        await queryRunner.query("ALTER TABLE `billing_report_drivers_contact` DROP FOREIGN KEY `FK_6a0d049fa13de162e2c5ab2a489`");
        await queryRunner.query("ALTER TABLE `billing_report_els_contact` DROP FOREIGN KEY `FK_bc80b504be0a7cf942c843e724d`");
        await queryRunner.query("ALTER TABLE `billing_report_els_contact` DROP FOREIGN KEY `FK_1f55d12708e33de69c090f73994`");
        await queryRunner.query("ALTER TABLE `contact_contact_groups_contact_group` DROP FOREIGN KEY `FK_64e50efc14e7529c3f9076b7833`");
        await queryRunner.query("ALTER TABLE `contact_contact_groups_contact_group` DROP FOREIGN KEY `FK_e2d2630651d62e3cb3800ed7af6`");
        await queryRunner.query("ALTER TABLE `billing_report` DROP FOREIGN KEY `FK_d247f4450224d7da76b1c667242`");
        await queryRunner.query("ALTER TABLE `billing_report` DROP FOREIGN KEY `FK_54492479441ad4214d126ff1093`");
        await queryRunner.query("ALTER TABLE `billing_report` DROP FOREIGN KEY `FK_165649b6b3e33605f0869ae07dc`");
        await queryRunner.query("ALTER TABLE `billing_report` DROP FOREIGN KEY `FK_f04f63d9092daa3249bdec810f7`");
        await queryRunner.query("ALTER TABLE `order` DROP FOREIGN KEY `FK_88a7cef913aee3fd9ac590a2845`");
        await queryRunner.query("ALTER TABLE `position` DROP FOREIGN KEY `FK_8a8517acfb74f39261e539bc508`");
        await queryRunner.query("ALTER TABLE `user` DROP FOREIGN KEY `FK_ac138d90419beda4e06a0477a68`");
        await queryRunner.query("ALTER TABLE `contact` DROP FOREIGN KEY `FK_48157734434a60a92c5d35ce4d8`");
        await queryRunner.query("ALTER TABLE `contact_extension` DROP FOREIGN KEY `FK_806254a82ee6371fe241c0ee16a`");
        await queryRunner.query("ALTER TABLE `contact_extension` DROP FOREIGN KEY `FK_674fec05583d50761a99d7a7bab`");
        await queryRunner.query("ALTER TABLE `contact_extension` DROP FOREIGN KEY `FK_91608ced3678df19fe6480ab723`");
        await queryRunner.query("ALTER TABLE `compensation` DROP FOREIGN KEY `FK_5323a5e31b3ad735bb32c0b0a18`");
        await queryRunner.query("ALTER TABLE `compensation` DROP FOREIGN KEY `FK_407f0779ad648ef055d5e0ea1ca`");
        await queryRunner.query("ALTER TABLE `compensation` DROP FOREIGN KEY `FK_94024c01a701188f680561a2dcf`");
        await queryRunner.query("ALTER TABLE `compensation` DROP FOREIGN KEY `FK_7f193f4248bc7ef48a77f7a6e5c`");
        await queryRunner.query("ALTER TABLE `compensation` DROP FOREIGN KEY `FK_2ed520d194809163bd48bb2a904`");
        await queryRunner.query("ALTER TABLE `compensation` DROP FOREIGN KEY `FK_ceedcb3d9d599a5890f175074d5`");
        await queryRunner.query("ALTER TABLE `compensation` DROP FOREIGN KEY `FK_ea606547e5d5246302f8c714da9`");
        await queryRunner.query("ALTER TABLE `compensation` DROP FOREIGN KEY `FK_58f23f5397e5157cf72240d992e`");
        await queryRunner.query("ALTER TABLE `payout` DROP FOREIGN KEY `FK_876e91c2b7fe7c3754d27f93925`");
        await queryRunner.query("DROP INDEX `IDX_3901c8f9f43da25ce0b0fd8c74` ON `billing_report_drivers_contact`");
        await queryRunner.query("DROP INDEX `IDX_6a0d049fa13de162e2c5ab2a48` ON `billing_report_drivers_contact`");
        await queryRunner.query("DROP INDEX `IDX_bc80b504be0a7cf942c843e724` ON `billing_report_els_contact`");
        await queryRunner.query("DROP INDEX `IDX_1f55d12708e33de69c090f7399` ON `billing_report_els_contact`");
        await queryRunner.query("DROP INDEX `IDX_64e50efc14e7529c3f9076b783` ON `contact_contact_groups_contact_group`");
        await queryRunner.query("DROP INDEX `IDX_e2d2630651d62e3cb3800ed7af` ON `contact_contact_groups_contact_group`");
        await queryRunner.query("ALTER TABLE `billing_report_drivers_contact` ADD CONSTRAINT `FK_6a0d049fa13de162e2c5ab2a489` FOREIGN KEY (`billingReportId`) REFERENCES `billing_report`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT");
        await queryRunner.query("ALTER TABLE `billing_report_drivers_contact` ADD CONSTRAINT `FK_3901c8f9f43da25ce0b0fd8c746` FOREIGN KEY (`contactId`) REFERENCES `contact`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT");
        await queryRunner.query("ALTER TABLE `billing_report_els_contact` ADD CONSTRAINT `FK_bc80b504be0a7cf942c843e724d` FOREIGN KEY (`contactId`) REFERENCES `contact`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT");
        await queryRunner.query("ALTER TABLE `billing_report_els_contact` ADD CONSTRAINT `FK_1f55d12708e33de69c090f73994` FOREIGN KEY (`billingReportId`) REFERENCES `billing_report`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT");
        await queryRunner.query("ALTER TABLE `contact_contact_groups_contact_group` ADD CONSTRAINT `FK_e2d2630651d62e3cb3800ed7af6` FOREIGN KEY (`contactId`) REFERENCES `contact`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT");
        await queryRunner.query("ALTER TABLE `contact_contact_groups_contact_group` ADD CONSTRAINT `FK_64e50efc14e7529c3f9076b7833` FOREIGN KEY (`contactGroupId`) REFERENCES `contact_group`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT");
        await queryRunner.query("ALTER TABLE `billing_report` ADD CONSTRAINT `FK_f04f63d9092daa3249bdec810f7` FOREIGN KEY (`creatorId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT");
        await queryRunner.query("ALTER TABLE `billing_report` ADD CONSTRAINT `FK_d247f4450224d7da76b1c667242` FOREIGN KEY (`updatedById`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT");
        await queryRunner.query("ALTER TABLE `billing_report` ADD CONSTRAINT `FK_54492479441ad4214d126ff1093` FOREIGN KEY (`approvedById`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT");
        await queryRunner.query("ALTER TABLE `billing_report` ADD CONSTRAINT `FK_165649b6b3e33605f0869ae07dc` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT");
        await queryRunner.query("ALTER TABLE `order` ADD CONSTRAINT `FK_88a7cef913aee3fd9ac590a2845` FOREIGN KEY (`contactId`) REFERENCES `contact`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT");
        await queryRunner.query("ALTER TABLE `position` ADD CONSTRAINT `FK_8a8517acfb74f39261e539bc508` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT");
        await queryRunner.query("ALTER TABLE `user` ADD CONSTRAINT `FK_ac138d90419beda4e06a0477a68` FOREIGN KEY (`bexioContactId`) REFERENCES `contact`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT");
        await queryRunner.query("ALTER TABLE `contact` ADD CONSTRAINT `FK_48157734434a60a92c5d35ce4d8` FOREIGN KEY (`contactTypeId`) REFERENCES `contact_type`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT");
        await queryRunner.query("ALTER TABLE `contact_extension` ADD CONSTRAINT `FK_91608ced3678df19fe6480ab723` FOREIGN KEY (`contactId`) REFERENCES `contact`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT");
        await queryRunner.query("ALTER TABLE `contact_extension` ADD CONSTRAINT `FK_806254a82ee6371fe241c0ee16a` FOREIGN KEY (`updatedById`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT");
        await queryRunner.query("ALTER TABLE `contact_extension` ADD CONSTRAINT `FK_674fec05583d50761a99d7a7bab` FOREIGN KEY (`collectionPointId`) REFERENCES `collection_point`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT");
        await queryRunner.query("ALTER TABLE `compensation` ADD CONSTRAINT `FK_ea606547e5d5246302f8c714da9` FOREIGN KEY (`creatorId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT");
        await queryRunner.query("ALTER TABLE `compensation` ADD CONSTRAINT `FK_ceedcb3d9d599a5890f175074d5` FOREIGN KEY (`approvedById`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT");
        await queryRunner.query("ALTER TABLE `compensation` ADD CONSTRAINT `FK_94024c01a701188f680561a2dcf` FOREIGN KEY (`updatedById`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT");
        await queryRunner.query("ALTER TABLE `compensation` ADD CONSTRAINT `FK_7f193f4248bc7ef48a77f7a6e5c` FOREIGN KEY (`transferCompensationId`) REFERENCES `compensation`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT");
        await queryRunner.query("ALTER TABLE `compensation` ADD CONSTRAINT `FK_58f23f5397e5157cf72240d992e` FOREIGN KEY (`memberId`) REFERENCES `contact`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT");
        await queryRunner.query("ALTER TABLE `compensation` ADD CONSTRAINT `FK_5323a5e31b3ad735bb32c0b0a18` FOREIGN KEY (`billingReportId`) REFERENCES `billing_report`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT");
        await queryRunner.query("ALTER TABLE `compensation` ADD CONSTRAINT `FK_407f0779ad648ef055d5e0ea1ca` FOREIGN KEY (`deletedById`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT");
        await queryRunner.query("ALTER TABLE `compensation` ADD CONSTRAINT `FK_2ed520d194809163bd48bb2a904` FOREIGN KEY (`payoutId`) REFERENCES `payout`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT");
        await queryRunner.query("ALTER TABLE `payout` ADD CONSTRAINT `FK_876e91c2b7fe7c3754d27f93925` FOREIGN KEY (`updatedById`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT");
    }

}