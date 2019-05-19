"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class init1555000000000 {
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query("CREATE TABLE `payout` (`id` int NOT NULL AUTO_INCREMENT, `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6), `date` date NOT NULL, `updatedById` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
            yield queryRunner.query("CREATE TABLE `compensation` (`id` int NOT NULL AUTO_INCREMENT, `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6), `memberId` int NULL, `amount` decimal(10,2) NOT NULL, `date` date NOT NULL, `approved` tinyint NOT NULL, `paied` tinyint NOT NULL, `valutaDate` date NULL, `deletedAt` date NULL, `billingReportId` int NULL, `dayHours` int NULL DEFAULT 0, `nightHours` int NULL DEFAULT 0, `from` datetime(6) NULL, `until` datetime(6) NULL, `charge` tinyint NULL, `description` text NULL, `type` varchar(255) NOT NULL, `creatorId` int NULL, `approvedById` int NULL, `payoutId` int NULL, `updatedById` int NULL, `deletedById` int NULL, INDEX `IDX_f9677a5a6d2bef1e0a27839b0b` (`type`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
            yield queryRunner.query("CREATE TABLE `contact_type` (`id` int NOT NULL AUTO_INCREMENT, `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6), `bexioId` int NOT NULL, `name` text NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
            yield queryRunner.query("CREATE TABLE `contact_group` (`id` int NOT NULL AUTO_INCREMENT, `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6), `bexioId` int NOT NULL, `name` text NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
            yield queryRunner.query("CREATE TABLE `collection_point` (`id` int NOT NULL AUTO_INCREMENT, `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6), `name` text NOT NULL, `address` text NOT NULL, `postcode` text NOT NULL, `city` text NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
            yield queryRunner.query("CREATE TABLE `contact_extension` (`id` int NOT NULL AUTO_INCREMENT, `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6), `contactId` int NULL, `entryDate` date NULL, `exitDate` date NULL, `collectionPointId` int NULL, `updatedById` int NULL, UNIQUE INDEX `REL_91608ced3678df19fe6480ab72` (`contactId`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
            yield queryRunner.query("CREATE TABLE `contact` (`id` int NOT NULL AUTO_INCREMENT, `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6), `bexioId` int NOT NULL, `nr` text NOT NULL, `firstname` text NOT NULL, `lastname` text NOT NULL, `birthday` date NOT NULL, `address` text NOT NULL, `postcode` text NOT NULL, `city` text NOT NULL, `mail` text NOT NULL, `mailSecond` text NULL, `phoneFixed` text NULL, `phoneFixedSecond` text NULL, `phoneMobile` text NULL, `remarks` text NULL, `ownerId` int NOT NULL, `contactTypeId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
            yield queryRunner.query("CREATE TABLE `user` (`id` int NOT NULL AUTO_INCREMENT, `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6), `outlookId` text NULL, `accessToken` text NULL, `refreshToken` text NULL, `displayName` text NOT NULL, `roles` text NOT NULL, `bexioContactId` int NULL, UNIQUE INDEX `REL_ac138d90419beda4e06a0477a6` (`bexioContactId`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
            yield queryRunner.query("CREATE TABLE `position` (`id` int NOT NULL AUTO_INCREMENT, `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6), `bexioId` int NOT NULL, `orderBexioId` int NOT NULL, `positionType` text NOT NULL, `text` text NULL, `pos` text NULL, `internalPos` text NULL, `articleId` int NULL, `positionTotal` decimal(10,2) NULL, `orderId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
            yield queryRunner.query("CREATE TABLE `order` (`id` int NOT NULL AUTO_INCREMENT, `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6), `bexioId` int NOT NULL, `documentNr` text NOT NULL, `title` text NOT NULL, `total` decimal(10,2) NOT NULL, `validFrom` date NULL, `deliveryAddress` text NOT NULL, `contactId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
            yield queryRunner.query("CREATE TABLE `billing_report` (`id` int NOT NULL AUTO_INCREMENT, `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6), `orderId` int NULL, `date` date NOT NULL, `food` tinyint NOT NULL, `remarks` text NOT NULL, `state` text NOT NULL, `creatorId` int NULL, `approvedById` int NULL, `updatedById` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
            yield queryRunner.query("CREATE TABLE `contact_contact_groups_contact_group` (`contactId` int NOT NULL, `contactGroupId` int NOT NULL, PRIMARY KEY (`contactId`, `contactGroupId`)) ENGINE=InnoDB");
            yield queryRunner.query("CREATE TABLE `billing_report_els_contact` (`billingReportId` int NOT NULL, `contactId` int NOT NULL, PRIMARY KEY (`billingReportId`, `contactId`)) ENGINE=InnoDB");
            yield queryRunner.query("CREATE TABLE `billing_report_drivers_contact` (`billingReportId` int NOT NULL, `contactId` int NOT NULL, PRIMARY KEY (`billingReportId`, `contactId`)) ENGINE=InnoDB");
            yield queryRunner.query("ALTER TABLE `payout` ADD CONSTRAINT `FK_876e91c2b7fe7c3754d27f93925` FOREIGN KEY (`updatedById`) REFERENCES `user`(`id`)");
            yield queryRunner.query("ALTER TABLE `compensation` ADD CONSTRAINT `FK_58f23f5397e5157cf72240d992e` FOREIGN KEY (`memberId`) REFERENCES `contact`(`id`)");
            yield queryRunner.query("ALTER TABLE `compensation` ADD CONSTRAINT `FK_ea606547e5d5246302f8c714da9` FOREIGN KEY (`creatorId`) REFERENCES `user`(`id`)");
            yield queryRunner.query("ALTER TABLE `compensation` ADD CONSTRAINT `FK_ceedcb3d9d599a5890f175074d5` FOREIGN KEY (`approvedById`) REFERENCES `user`(`id`)");
            yield queryRunner.query("ALTER TABLE `compensation` ADD CONSTRAINT `FK_2ed520d194809163bd48bb2a904` FOREIGN KEY (`payoutId`) REFERENCES `payout`(`id`)");
            yield queryRunner.query("ALTER TABLE `compensation` ADD CONSTRAINT `FK_94024c01a701188f680561a2dcf` FOREIGN KEY (`updatedById`) REFERENCES `user`(`id`)");
            yield queryRunner.query("ALTER TABLE `compensation` ADD CONSTRAINT `FK_407f0779ad648ef055d5e0ea1ca` FOREIGN KEY (`deletedById`) REFERENCES `user`(`id`)");
            yield queryRunner.query("ALTER TABLE `compensation` ADD CONSTRAINT `FK_5323a5e31b3ad735bb32c0b0a18` FOREIGN KEY (`billingReportId`) REFERENCES `billing_report`(`id`)");
            yield queryRunner.query("ALTER TABLE `contact_extension` ADD CONSTRAINT `FK_91608ced3678df19fe6480ab723` FOREIGN KEY (`contactId`) REFERENCES `contact`(`id`)");
            yield queryRunner.query("ALTER TABLE `contact_extension` ADD CONSTRAINT `FK_674fec05583d50761a99d7a7bab` FOREIGN KEY (`collectionPointId`) REFERENCES `collection_point`(`id`)");
            yield queryRunner.query("ALTER TABLE `contact_extension` ADD CONSTRAINT `FK_806254a82ee6371fe241c0ee16a` FOREIGN KEY (`updatedById`) REFERENCES `user`(`id`)");
            yield queryRunner.query("ALTER TABLE `contact` ADD CONSTRAINT `FK_48157734434a60a92c5d35ce4d8` FOREIGN KEY (`contactTypeId`) REFERENCES `contact_type`(`id`)");
            yield queryRunner.query("ALTER TABLE `user` ADD CONSTRAINT `FK_ac138d90419beda4e06a0477a68` FOREIGN KEY (`bexioContactId`) REFERENCES `contact`(`id`)");
            yield queryRunner.query("ALTER TABLE `position` ADD CONSTRAINT `FK_8a8517acfb74f39261e539bc508` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`)");
            yield queryRunner.query("ALTER TABLE `order` ADD CONSTRAINT `FK_88a7cef913aee3fd9ac590a2845` FOREIGN KEY (`contactId`) REFERENCES `contact`(`id`)");
            yield queryRunner.query("ALTER TABLE `billing_report` ADD CONSTRAINT `FK_f04f63d9092daa3249bdec810f7` FOREIGN KEY (`creatorId`) REFERENCES `user`(`id`)");
            yield queryRunner.query("ALTER TABLE `billing_report` ADD CONSTRAINT `FK_165649b6b3e33605f0869ae07dc` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`)");
            yield queryRunner.query("ALTER TABLE `billing_report` ADD CONSTRAINT `FK_54492479441ad4214d126ff1093` FOREIGN KEY (`approvedById`) REFERENCES `user`(`id`)");
            yield queryRunner.query("ALTER TABLE `billing_report` ADD CONSTRAINT `FK_d247f4450224d7da76b1c667242` FOREIGN KEY (`updatedById`) REFERENCES `user`(`id`)");
            yield queryRunner.query("ALTER TABLE `contact_contact_groups_contact_group` ADD CONSTRAINT `FK_e2d2630651d62e3cb3800ed7af6` FOREIGN KEY (`contactId`) REFERENCES `contact`(`id`) ON DELETE CASCADE");
            yield queryRunner.query("ALTER TABLE `contact_contact_groups_contact_group` ADD CONSTRAINT `FK_64e50efc14e7529c3f9076b7833` FOREIGN KEY (`contactGroupId`) REFERENCES `contact_group`(`id`) ON DELETE CASCADE");
            yield queryRunner.query("ALTER TABLE `billing_report_els_contact` ADD CONSTRAINT `FK_1f55d12708e33de69c090f73994` FOREIGN KEY (`billingReportId`) REFERENCES `billing_report`(`id`) ON DELETE CASCADE");
            yield queryRunner.query("ALTER TABLE `billing_report_els_contact` ADD CONSTRAINT `FK_bc80b504be0a7cf942c843e724d` FOREIGN KEY (`contactId`) REFERENCES `contact`(`id`) ON DELETE CASCADE");
            yield queryRunner.query("ALTER TABLE `billing_report_drivers_contact` ADD CONSTRAINT `FK_6a0d049fa13de162e2c5ab2a489` FOREIGN KEY (`billingReportId`) REFERENCES `billing_report`(`id`) ON DELETE CASCADE");
            yield queryRunner.query("ALTER TABLE `billing_report_drivers_contact` ADD CONSTRAINT `FK_3901c8f9f43da25ce0b0fd8c746` FOREIGN KEY (`contactId`) REFERENCES `contact`(`id`) ON DELETE CASCADE");
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query("ALTER TABLE `billing_report_drivers_contact` DROP FOREIGN KEY `FK_3901c8f9f43da25ce0b0fd8c746`");
            yield queryRunner.query("ALTER TABLE `billing_report_drivers_contact` DROP FOREIGN KEY `FK_6a0d049fa13de162e2c5ab2a489`");
            yield queryRunner.query("ALTER TABLE `billing_report_els_contact` DROP FOREIGN KEY `FK_bc80b504be0a7cf942c843e724d`");
            yield queryRunner.query("ALTER TABLE `billing_report_els_contact` DROP FOREIGN KEY `FK_1f55d12708e33de69c090f73994`");
            yield queryRunner.query("ALTER TABLE `contact_contact_groups_contact_group` DROP FOREIGN KEY `FK_64e50efc14e7529c3f9076b7833`");
            yield queryRunner.query("ALTER TABLE `contact_contact_groups_contact_group` DROP FOREIGN KEY `FK_e2d2630651d62e3cb3800ed7af6`");
            yield queryRunner.query("ALTER TABLE `billing_report` DROP FOREIGN KEY `FK_d247f4450224d7da76b1c667242`");
            yield queryRunner.query("ALTER TABLE `billing_report` DROP FOREIGN KEY `FK_54492479441ad4214d126ff1093`");
            yield queryRunner.query("ALTER TABLE `billing_report` DROP FOREIGN KEY `FK_165649b6b3e33605f0869ae07dc`");
            yield queryRunner.query("ALTER TABLE `billing_report` DROP FOREIGN KEY `FK_f04f63d9092daa3249bdec810f7`");
            yield queryRunner.query("ALTER TABLE `order` DROP FOREIGN KEY `FK_88a7cef913aee3fd9ac590a2845`");
            yield queryRunner.query("ALTER TABLE `position` DROP FOREIGN KEY `FK_8a8517acfb74f39261e539bc508`");
            yield queryRunner.query("ALTER TABLE `user` DROP FOREIGN KEY `FK_ac138d90419beda4e06a0477a68`");
            yield queryRunner.query("ALTER TABLE `contact` DROP FOREIGN KEY `FK_48157734434a60a92c5d35ce4d8`");
            yield queryRunner.query("ALTER TABLE `contact_extension` DROP FOREIGN KEY `FK_806254a82ee6371fe241c0ee16a`");
            yield queryRunner.query("ALTER TABLE `contact_extension` DROP FOREIGN KEY `FK_674fec05583d50761a99d7a7bab`");
            yield queryRunner.query("ALTER TABLE `contact_extension` DROP FOREIGN KEY `FK_91608ced3678df19fe6480ab723`");
            yield queryRunner.query("ALTER TABLE `compensation` DROP FOREIGN KEY `FK_5323a5e31b3ad735bb32c0b0a18`");
            yield queryRunner.query("ALTER TABLE `compensation` DROP FOREIGN KEY `FK_407f0779ad648ef055d5e0ea1ca`");
            yield queryRunner.query("ALTER TABLE `compensation` DROP FOREIGN KEY `FK_94024c01a701188f680561a2dcf`");
            yield queryRunner.query("ALTER TABLE `compensation` DROP FOREIGN KEY `FK_2ed520d194809163bd48bb2a904`");
            yield queryRunner.query("ALTER TABLE `compensation` DROP FOREIGN KEY `FK_ceedcb3d9d599a5890f175074d5`");
            yield queryRunner.query("ALTER TABLE `compensation` DROP FOREIGN KEY `FK_ea606547e5d5246302f8c714da9`");
            yield queryRunner.query("ALTER TABLE `compensation` DROP FOREIGN KEY `FK_58f23f5397e5157cf72240d992e`");
            yield queryRunner.query("ALTER TABLE `payout` DROP FOREIGN KEY `FK_876e91c2b7fe7c3754d27f93925`");
            yield queryRunner.query("DROP TABLE `billing_report_drivers_contact`");
            yield queryRunner.query("DROP TABLE `billing_report_els_contact`");
            yield queryRunner.query("DROP TABLE `contact_contact_groups_contact_group`");
            yield queryRunner.query("DROP TABLE `billing_report`");
            yield queryRunner.query("DROP TABLE `order`");
            yield queryRunner.query("DROP TABLE `position`");
            yield queryRunner.query("DROP INDEX `REL_ac138d90419beda4e06a0477a6` ON `user`");
            yield queryRunner.query("DROP TABLE `user`");
            yield queryRunner.query("DROP TABLE `contact`");
            yield queryRunner.query("DROP INDEX `REL_91608ced3678df19fe6480ab72` ON `contact_extension`");
            yield queryRunner.query("DROP TABLE `contact_extension`");
            yield queryRunner.query("DROP TABLE `collection_point`");
            yield queryRunner.query("DROP TABLE `contact_group`");
            yield queryRunner.query("DROP TABLE `contact_type`");
            yield queryRunner.query("DROP INDEX `IDX_f9677a5a6d2bef1e0a27839b0b` ON `compensation`");
            yield queryRunner.query("DROP TABLE `compensation`");
            yield queryRunner.query("DROP TABLE `payout`");
        });
    }
}
exports.init1555000000000 = init1555000000000;
//# sourceMappingURL=1555000000000-init.js.map