import {MigrationInterface, QueryRunner} from "typeorm";

export class afterUserIDRemoval1552437389451 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `order` DROP FOREIGN KEY `FK_caabe91507b3379c7ba73637b84`");
        await queryRunner.query("ALTER TABLE `contact` DROP COLUMN `userId`");
        await queryRunner.query("ALTER TABLE `order` DROP COLUMN `userId`");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `order` ADD `userId` int NULL");
        await queryRunner.query("ALTER TABLE `contact` ADD `userId` int NOT NULL");
        await queryRunner.query("ALTER TABLE `order` ADD CONSTRAINT `FK_caabe91507b3379c7ba73637b84` FOREIGN KEY (`userId`) REFERENCES `contact`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

}
