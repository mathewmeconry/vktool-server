import {MigrationInterface, QueryRunner} from "typeorm";

export class ProductInterNameIndex1604948147615 implements MigrationInterface {
    name = 'ProductInterNameIndex1604948147615'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_8713bb623d5e79318ce85524e7` ON `product` (`internName`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_8713bb623d5e79318ce85524e7` ON `product`");
    }

}
