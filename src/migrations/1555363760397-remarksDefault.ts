import {MigrationInterface, QueryRunner} from "typeorm";

export class remarksDefault1555363760397 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `billing_report` CHANGE `remarks` `remarks` text NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `billing_report` CHANGE `remarks` `remarks` text NOT NULL");
    }

}
