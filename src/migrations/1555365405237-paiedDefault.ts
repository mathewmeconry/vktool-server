import {MigrationInterface, QueryRunner} from "typeorm";

export class paiedDefault1555365405237 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `compensation` CHANGE `paied` `paied` tinyint NOT NULL DEFAULT 0");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `compensation` CHANGE `paied` `paied` tinyint NOT NULL");
    }

}
