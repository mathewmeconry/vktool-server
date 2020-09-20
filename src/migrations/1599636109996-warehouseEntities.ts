import {MigrationInterface, QueryRunner} from "typeorm";

export class warehouseEntities1599636109996 implements MigrationInterface {
    name = 'warehouseEntities1599636109996'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `material_changelog_to_product` (`id` int NOT NULL AUTO_INCREMENT, `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6), `amount` int NOT NULL, `charge` tinyint NOT NULL, `number` int NULL, `deletedAt` datetime(6) NULL, `productId` int NULL, `changelogId` int NULL, `compensationId` int NULL, `deletedById` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `warehouse` (`id` int NOT NULL AUTO_INCREMENT, `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6), `name` varchar(255) NOT NULL, `maxWeight` int NULL, `deletedAt` datetime(6) NULL, `deletedById` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `material_changelog` (`id` int NOT NULL AUTO_INCREMENT, `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6), `date` datetime NOT NULL, `createdAt` datetime NOT NULL, `deletedAt` datetime(6) NULL, `creatorId` int NULL, `inContactId` int NULL, `outContactId` int NULL, `inWarehouseId` int NULL, `outWarehouseId` int NULL, `updatedById` int NULL, `deletedById` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `material_changelog_to_product` ADD CONSTRAINT `FK_2d8cd119f1e422c97c61294b13e` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `material_changelog_to_product` ADD CONSTRAINT `FK_aa13af4f29320027175824d95b7` FOREIGN KEY (`changelogId`) REFERENCES `material_changelog`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `material_changelog_to_product` ADD CONSTRAINT `FK_a8e5662848c99489f7d82fd73bb` FOREIGN KEY (`compensationId`) REFERENCES `compensation`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `material_changelog_to_product` ADD CONSTRAINT `FK_0e85f615d19ae74bbab2bc14bbc` FOREIGN KEY (`deletedById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `warehouse` ADD CONSTRAINT `FK_c821f26e8c3c8fe9784c8c898e6` FOREIGN KEY (`deletedById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `material_changelog` ADD CONSTRAINT `FK_57ffb79f9bf445e418695e0708f` FOREIGN KEY (`creatorId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `material_changelog` ADD CONSTRAINT `FK_8b716fe963b544e90fee0cd4c31` FOREIGN KEY (`inContactId`) REFERENCES `contact`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `material_changelog` ADD CONSTRAINT `FK_1f22416e100be283634662c26a5` FOREIGN KEY (`outContactId`) REFERENCES `contact`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `material_changelog` ADD CONSTRAINT `FK_1059538753493bcf63458fb5aad` FOREIGN KEY (`inWarehouseId`) REFERENCES `warehouse`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `material_changelog` ADD CONSTRAINT `FK_b040e3b81dbc9eeef82d06d3f2c` FOREIGN KEY (`outWarehouseId`) REFERENCES `warehouse`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `material_changelog` ADD CONSTRAINT `FK_cf7ba5215ab6db6c07f779f60b3` FOREIGN KEY (`updatedById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `material_changelog` ADD CONSTRAINT `FK_6478eaf6fd170cf1d7afb49df22` FOREIGN KEY (`deletedById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `material_changelog` DROP FOREIGN KEY `FK_6478eaf6fd170cf1d7afb49df22`");
        await queryRunner.query("ALTER TABLE `material_changelog` DROP FOREIGN KEY `FK_cf7ba5215ab6db6c07f779f60b3`");
        await queryRunner.query("ALTER TABLE `material_changelog` DROP FOREIGN KEY `FK_b040e3b81dbc9eeef82d06d3f2c`");
        await queryRunner.query("ALTER TABLE `material_changelog` DROP FOREIGN KEY `FK_1059538753493bcf63458fb5aad`");
        await queryRunner.query("ALTER TABLE `material_changelog` DROP FOREIGN KEY `FK_1f22416e100be283634662c26a5`");
        await queryRunner.query("ALTER TABLE `material_changelog` DROP FOREIGN KEY `FK_8b716fe963b544e90fee0cd4c31`");
        await queryRunner.query("ALTER TABLE `material_changelog` DROP FOREIGN KEY `FK_57ffb79f9bf445e418695e0708f`");
        await queryRunner.query("ALTER TABLE `warehouse` DROP FOREIGN KEY `FK_c821f26e8c3c8fe9784c8c898e6`");
        await queryRunner.query("ALTER TABLE `material_changelog_to_product` DROP FOREIGN KEY `FK_0e85f615d19ae74bbab2bc14bbc`");
        await queryRunner.query("ALTER TABLE `material_changelog_to_product` DROP FOREIGN KEY `FK_a8e5662848c99489f7d82fd73bb`");
        await queryRunner.query("ALTER TABLE `material_changelog_to_product` DROP FOREIGN KEY `FK_aa13af4f29320027175824d95b7`");
        await queryRunner.query("ALTER TABLE `material_changelog_to_product` DROP FOREIGN KEY `FK_2d8cd119f1e422c97c61294b13e`");
        await queryRunner.query("ALTER TABLE `billing_report` DROP FOREIGN KEY `FK_f04f63d9092daa3249bdec810f7`");
        await queryRunner.query("DROP TABLE `material_changelog`");
        await queryRunner.query("DROP TABLE `warehouse`");
        await queryRunner.query("DROP TABLE `material_changelog_to_product`");
    }

}
