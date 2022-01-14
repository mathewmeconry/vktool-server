import { Field, ObjectType } from 'type-graphql';
import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
	expression: (connection) =>
		connection
			.createQueryBuilder()
			.select('c.id', 'contactId')
			.addSelect('mctpx.productId', 'productId')
			.addSelect(
				(qb) =>
					qb
						.select('coalesce(sum(mctp.amount), 0)')
						.from('material_changelog', 'mc')
						.innerJoin('material_changelog_to_product', 'mctp', 'mctp.changelogId = mc.id')
						.where('mc.inContactId = c.id')
						.andWhere('mctp.productId = mctpx.productId')
						.andWhere('mctp.deletedAt is null')
						.andWhere('mc.deletedAt is null'),
				'inAmount'
			)
			.addSelect(
				(qb) =>
					qb
						.select('coalesce(sum(mctp.amount), 0)')
						.from('material_changelog', 'mc')
						.innerJoin('material_changelog_to_product', 'mctp', 'mctp.changelogId = mc.id')
						.where('mc.outContactId = c.id')
						.andWhere('mctp.productId = mctpx.productId')
						.andWhere('mctp.deletedAt is null')
						.andWhere('mc.deletedAt is null'),
				'outAmount'
			)
			.from('contact', 'c')
			.leftJoin('material_changelog', 'mc', 'mc.inContactId = c.id')
			.leftJoin('material_changelog_to_product', 'mctpx', 'mctpx.changelogId = mc.id')
			.where('mc.deletedAt IS NULL')
			.andWhere('mctpx.deletedAt is NULL'),
})
@ObjectType()
export class MaterialChangelog2ContactView {
	@ViewColumn()
	public contactId: number;

	@ViewColumn()
	public productId: number;

	@ViewColumn()
	@Field((type) => Number)
	public inAmount: number;

	@ViewColumn()
	@Field((type) => Number)
	public outAmount: number;
}
