import { MigrationInterface, QueryRunner } from 'typeorm';

export class fulltextUser1590703536750 implements MigrationInterface {
	name = 'fulltextUser1590703536750';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			'CREATE FULLTEXT INDEX `IDX_059e69c318702e93998f26d152` ON `user` (`displayName`)'
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('DROP INDEX `IDX_059e69c318702e93998f26d152` ON `user`');
	}
}
