import {MigrationInterface, QueryRunner} from "typeorm";

export class ProductArticleTypeNullable1601998853086 implements MigrationInterface {
    name = 'ProductArticleTypeNullable1601998853086'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `product` CHANGE `articleType` `articleType` int NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `purchasePrice` `purchasePrice` float NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `salePrice` `salePrice` float NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `purchaseTotal` `purchaseTotal` float NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `saleTotal` `saleTotal` float NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `deliveryPrice` `deliveryPrice` float NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `weight` `weight` float NULL");
     }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `product` CHANGE `weight` `weight` float(12) NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `deliveryPrice` `deliveryPrice` float(12) NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `saleTotal` `saleTotal` float(12) NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `purchaseTotal` `purchaseTotal` float(12) NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `salePrice` `salePrice` float(12) NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `purchasePrice` `purchasePrice` float(12) NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `articleType` `articleType` int NOT NULL");
    }

}
