import { MigrationInterface, QueryRunner } from 'typeorm';

export class Mc2ContactView1642157771694 implements MigrationInterface {
	name = 'Mc2ContactView1642157771694';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			'CREATE TABLE `typeorm_metadata` (`type` varchar(255) NOT NULL,`database` varchar(255) DEFAULT NULL,`schema` varchar(255) DEFAULT NULL,`table` varchar(255) DEFAULT NULL,`name` varchar(255) DEFAULT NULL,`value` text) ENGINE=InnoDB'
		);
		await queryRunner.query(
			`CREATE VIEW \`material_changelog2_contact_view\` AS SELECT \`c\`.\`id\` AS \`contactId\`, \`mctpx\`.\`productId\` AS \`productId\`, (SELECT coalesce(sum(\`mctp\`.\`amount\`), 0) FROM \`material_changelog\` \`mc\` INNER JOIN \`material_changelog_to_product\` \`mctp\` ON  \`mctp\`.\`changelogId\` = \`mc\`.\`id\` AND \`mctp\`.\`deletedAt\` IS NULL WHERE ( \`mc\`.\`inContactId\` = \`c\`.\`id\` AND \`mctp\`.\`productId\` = \`mctpx\`.\`productId\` AND \`mctp\`.\`deletedAt\` is null AND \`mc\`.\`deletedAt\` is null ) AND ( \`mc\`.\`deletedAt\` IS NULL )) AS \`inAmount\`, (SELECT coalesce(sum(\`mctp\`.\`amount\`), 0) FROM \`material_changelog\` \`mc\` INNER JOIN \`material_changelog_to_product\` \`mctp\` ON  \`mctp\`.\`changelogId\` = \`mc\`.\`id\` AND \`mctp\`.\`deletedAt\` IS NULL WHERE ( \`mc\`.\`outContactId\` = \`c\`.\`id\` AND \`mctp\`.\`productId\` = \`mctpx\`.\`productId\` AND \`mctp\`.\`deletedAt\` is null AND \`mc\`.\`deletedAt\` is null ) AND ( \`mc\`.\`deletedAt\` IS NULL )) AS \`outAmount\` FROM \`contact\` \`c\` LEFT JOIN \`material_changelog\` \`mc\` ON  \`mc\`.\`inContactId\` = \`c\`.\`id\` AND \`mc\`.\`deletedAt\` IS NULL  LEFT JOIN \`material_changelog_to_product\` \`mctpx\` ON  \`mctpx\`.\`changelogId\` = \`mc\`.\`id\` AND \`mctpx\`.\`deletedAt\` IS NULL WHERE \`mc\`.\`deletedAt\` IS NULL AND \`mctpx\`.\`deletedAt\` is NULL`
		);
		await queryRunner.query(
			`INSERT INTO \`vktool\`.\`typeorm_metadata\`(\`type\`, \`schema\`, \`name\`, \`value\`) VALUES (?, ?, ?, ?)`,
			[
				'VIEW',
				'vktool',
				'material_changelog2_contact_view',
				'SELECT `c`.`id` AS `contactId`, `mc`.`id` AS `changelogId`, `mctpx`.`id` AS `materialChangelogToProductId`, `mctpx`.`productId` AS `productId`, (SELECT coalesce(sum(`mctp`.`amount`), 0) FROM `material_changelog` `mc` INNER JOIN `material_changelog_to_product` `mctp` ON  `mctp`.`changelogId` = `mc`.`id` AND `mctp`.`deletedAt` IS NULL WHERE ( `mc`.`inContactId` = `c`.`id` AND `mctp`.`productId` = `mctpx`.`productId` AND `mctp`.`deletedAt` is null AND `mc`.`deletedAt` is null ) AND ( `mc`.`deletedAt` IS NULL )) AS `inAmount`, (SELECT coalesce(sum(`mctp`.`amount`), 0) FROM `material_changelog` `mc` INNER JOIN `material_changelog_to_product` `mctp` ON  `mctp`.`changelogId` = `mc`.`id` AND `mctp`.`deletedAt` IS NULL WHERE ( `mc`.`outContactId` = `c`.`id` AND `mctp`.`productId` = `mctpx`.`productId` AND `mctp`.`deletedAt` is null AND `mc`.`deletedAt` is null ) AND ( `mc`.`deletedAt` IS NULL )) AS `outAmount` FROM `contact` `c` LEFT JOIN `material_changelog` `mc` ON  `mc`.`inContactId` = `c`.`id` AND `mc`.`deletedAt` IS NULL  LEFT JOIN `material_changelog_to_product` `mctpx` ON  `mctpx`.`changelogId` = `mc`.`id` AND `mctpx`.`deletedAt` IS NULL WHERE `mc`.`deletedAt` IS NULL AND `mctpx`.`deletedAt` is NULL',
			]
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`DELETE FROM \`vktool\`.\`typeorm_metadata\` WHERE \`type\` = 'VIEW' AND \`schema\` = ? AND \`name\` = ?`,
			['vktool', 'material_changelog2_contact_view']
		);
		await queryRunner.query(`DROP VIEW \`material_changelog2_contact_view\``);
		await queryRunner.query('DROP TABLE typeorm_metadata');
	}
}
