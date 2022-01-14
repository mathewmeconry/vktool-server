import { MigrationInterface, QueryRunner } from 'typeorm';

export class Mc2WarehouseView1642159073421 implements MigrationInterface {
	name = 'Mc2WarehouseView1642159073421';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE VIEW \`material_changelog2_warehouse_view\` AS SELECT \`w\`.\`id\` AS \`warehouseId\`, \`mctpx\`.\`productId\` AS \`productId\`, (SELECT coalesce(sum(\`mctp\`.\`amount\`), 0) FROM \`material_changelog\` \`mc\` INNER JOIN \`material_changelog_to_product\` \`mctp\` ON  \`mctp\`.\`changelogId\` = \`mc\`.\`id\` AND \`mctp\`.\`deletedAt\` IS NULL WHERE ( \`mc\`.\`inWarehouseId\` = \`w\`.\`id\` AND \`mctp\`.\`productId\` = \`mctpx\`.\`productId\` AND \`mctp\`.\`deletedAt\` is null AND \`mc\`.\`deletedAt\` is null ) AND ( \`mc\`.\`deletedAt\` IS NULL )) AS \`inAmount\`, (SELECT coalesce(sum(\`mctp\`.\`amount\`), 0) FROM \`material_changelog\` \`mc\` INNER JOIN \`material_changelog_to_product\` \`mctp\` ON  \`mctp\`.\`changelogId\` = \`mc\`.\`id\` AND \`mctp\`.\`deletedAt\` IS NULL WHERE ( \`mc\`.\`outWarehouseId\` = \`w\`.\`id\` AND \`mctp\`.\`productId\` = \`mctpx\`.\`productId\` AND \`mctp\`.\`deletedAt\` is null AND \`mc\`.\`deletedAt\` is null ) AND ( \`mc\`.\`deletedAt\` IS NULL )) AS \`outAmount\` FROM \`warehouse\` \`w\` LEFT JOIN \`material_changelog\` \`mc\` ON  \`mc\`.\`inWarehouseId\` = \`w\`.\`id\` AND \`mc\`.\`deletedAt\` IS NULL  LEFT JOIN \`material_changelog_to_product\` \`mctpx\` ON  \`mctpx\`.\`changelogId\` = \`mc\`.\`id\` AND \`mctpx\`.\`deletedAt\` IS NULL WHERE ( \`mc\`.\`deletedAt\` IS NULL AND \`mctpx\`.\`deletedAt\` is NULL ) AND ( \`w\`.\`deletedAt\` IS NULL )`
		);
		await queryRunner.query(
			`INSERT INTO \`vktool\`.\`typeorm_metadata\`(\`type\`, \`schema\`, \`name\`, \`value\`) VALUES (?, ?, ?, ?)`,
			[
				'VIEW',
				'vktool',
				'material_changelog2_warehouse_view',
				'SELECT `w`.`id` AS `warehouseId`, `mc`.`id` AS `changelogId`, `mctpx`.`id` AS `materialChangelogToProductId`, `mctpx`.`productId` AS `productId`, (SELECT coalesce(sum(`mctp`.`amount`), 0) FROM `material_changelog` `mc` INNER JOIN `material_changelog_to_product` `mctp` ON  `mctp`.`changelogId` = `mc`.`id` AND `mctp`.`deletedAt` IS NULL WHERE ( `mc`.`inWarehouseId` = `w`.`id` AND `mctp`.`productId` = `mctpx`.`productId` AND `mctp`.`deletedAt` is null AND `mc`.`deletedAt` is null ) AND ( `mc`.`deletedAt` IS NULL )) AS `inAmount`, (SELECT coalesce(sum(`mctp`.`amount`), 0) FROM `material_changelog` `mc` INNER JOIN `material_changelog_to_product` `mctp` ON  `mctp`.`changelogId` = `mc`.`id` AND `mctp`.`deletedAt` IS NULL WHERE ( `mc`.`outWarehouseId` = `w`.`id` AND `mctp`.`productId` = `mctpx`.`productId` AND `mctp`.`deletedAt` is null AND `mc`.`deletedAt` is null ) AND ( `mc`.`deletedAt` IS NULL )) AS `outAmount` FROM `warehouse` `w` LEFT JOIN `material_changelog` `mc` ON  `mc`.`inWarehouseId` = `w`.`id` AND `mc`.`deletedAt` IS NULL  LEFT JOIN `material_changelog_to_product` `mctpx` ON  `mctpx`.`changelogId` = `mc`.`id` AND `mctpx`.`deletedAt` IS NULL WHERE ( `mc`.`deletedAt` IS NULL AND `mctpx`.`deletedAt` is NULL ) AND ( `w`.`deletedAt` IS NULL )',
			]
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`DELETE FROM \`vktool\`.\`typeorm_metadata\` WHERE \`type\` = 'VIEW' AND \`schema\` = ? AND \`name\` = ?`,
			['vktool', 'material_changelog2_warehouse_view']
		);
		await queryRunner.query(`DROP VIEW \`material_changelog2_warehouse_view\``);
	}
}
