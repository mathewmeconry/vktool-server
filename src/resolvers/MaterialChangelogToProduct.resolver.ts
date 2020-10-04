import { GraphQLError } from 'graphql';
import {
	InputType,
	Field,
	Resolver,
	FieldResolver,
	Root,
	Mutation,
	Arg,
	Authorized,
	Ctx,
	ID,
	Int,
	Query,
} from 'type-graphql';
import { getManager } from 'typeorm';
import { ApolloContext } from '../controllers/CliController';
import CustomCompensation from '../entities/CustomCompensation';
import MaterialChangelog from '../entities/MaterialChangelog';
import MaterialChangelogToProduct from '../entities/MaterialChangelogToProduct';
import Product from '../entities/Product';
import { AuthRoles } from '../interfaces/AuthRoles';
import AuthService from '../services/AuthService';
import { createResolver, resolveEntity } from './helpers';

const baseResolver = createResolver('MaterialChangelogToProduct', MaterialChangelogToProduct, [
	AuthRoles.MATERIAL_CHANGELOG_CREATE,
	AuthRoles.MATERIAL_CHANGELOG_EDIT,
	AuthRoles.MATERIAL_CHANGELOG_READ,
]);

@InputType()
export class AddMaterialChangelogToProduct implements Partial<MaterialChangelogToProduct> {
	@Field()
	public productId: number;

	@Field()
	public amount: number;

	@Field({ nullable: true })
	public number?: number;

	@Field()
	public charge: boolean;

	@Field()
	public changelogId: number;
}

@Resolver((of) => MaterialChangelogToProduct)
export default class MaterialChangelogToProductResolver extends baseResolver {
	@Authorized([AuthRoles.MATERIAL_CHANGELOG_CREATE])
	@Mutation((type) => MaterialChangelogToProduct)
	public async addMaterialChangelogToProduct(
		@Arg('data') data: AddMaterialChangelogToProduct,
		@Ctx() ctx: ApolloContext
	): Promise<MaterialChangelogToProduct> {
		if (data.amount <= 0) {
			throw new GraphQLError('Amount should be greather than 0');
		}

		const changelog = await resolveEntity<MaterialChangelog>(
			'MaterialChangelog',
			data.changelogId,
			['outContact']
		);
		const product = await resolveEntity<Product>('Product', data.productId);
		const mc2p = new MaterialChangelogToProduct();
		mc2p.product = product;
		mc2p.amount = data.amount;
		mc2p.number = data.number;
		mc2p.charge = data.charge;
		mc2p.changelog = changelog;

		if (changelog.outContact) {
			const comp = new CustomCompensation(
				changelog.outContact,
				ctx.user,
				(product.salePrice || 0) * mc2p.amount,
				new Date(),
				'Materialbezug',
				AuthService.isAuthorized(ctx.user.roles, AuthRoles.COMPENSATIONS_APPROVE)
			);
			await comp.save();
			mc2p.compensation = comp;
		}

		return mc2p.save();
	}

	@Authorized([AuthRoles.WAREHOUSE_READ])
	@Query((type) => [MaterialChangelogToProduct])
	public async getWarehouseStock(
		@Arg('id', () => ID) id: number
	): Promise<MaterialChangelogToProduct[]> {
		const inChanges = await getManager()
			.getRepository(MaterialChangelogToProduct)
			.createQueryBuilder('mc2p')
			.leftJoin('mc2p.changelog', 'mc')
			.leftJoin('mc2p.product', 'product')
			.where('mc.inWarehouseId = :warehouseId', { warehouseId: id })
			.getMany();
		const outChanges = await getManager()
			.getRepository(MaterialChangelogToProduct)
			.createQueryBuilder('mc2p')
			.leftJoin('mc2p.changelog', 'mc')
			.leftJoin('mc2p.product', 'product')
			.where('mc.outWarehouseId = :warehouseId', { warehouseId: id })
			.getMany();

		return this.aggregateChanges(inChanges, outChanges);
	}

	@Authorized([AuthRoles.CONTACTS_READ, AuthRoles.MEMBERS_READ])
	@Query((type) => [MaterialChangelogToProduct])
	public async getContactStock(
		@Arg('id', () => ID) id: number
	): Promise<MaterialChangelogToProduct[]> {
		const inChanges = await getManager()
			.getRepository(MaterialChangelogToProduct)
			.createQueryBuilder('mc2p')
			.leftJoin('mc2p.changelog', 'mc')
			.leftJoin('mc2p.product', 'product')
			.where('mc.inContactId = :contactId', { contactId: id })
			.getMany();
		const outChanges = await getManager()
			.getRepository(MaterialChangelogToProduct)
			.createQueryBuilder('mc2p')
			.leftJoin('mc2p.changelog', 'mc')
			.leftJoin('mc2p.product', 'product')
			.where('mc.outContactId = :outContactId', { outContactId: id })
			.getMany();

		return this.aggregateChanges(inChanges, outChanges);
	}

	@FieldResolver((type) => Product)
	public product(@Root() obj: MaterialChangelogToProduct): Promise<Product> {
		return resolveEntity('Product', obj.productId);
	}

	@FieldResolver((type) => MaterialChangelog)
	public changelog(@Root() obj: MaterialChangelogToProduct): Promise<MaterialChangelog> {
		return resolveEntity('MaterialChangelog', obj.changelogId);
	}

	@FieldResolver((type) => CustomCompensation, { nullable: true })
	public async compensation(
		@Root() obj: MaterialChangelogToProduct
	): Promise<CustomCompensation | null> {
		if (!obj.compensationId) {
			return null;
		}
		return resolveEntity('CustomCompensation', obj.compensationId);
	}

	private aggregateChanges(
		inChanges: MaterialChangelogToProduct[],
		outChanges: MaterialChangelogToProduct[]
	): MaterialChangelogToProduct[] {
		const aggregated: MaterialChangelogToProduct[] = [];

		for (const change of inChanges) {
			const index = aggregated.findIndex(
				(c) => c.productId === change.productId && c.number === change.number
			);
			if (index === -1) {
				aggregated.push(change);
			} else {
				aggregated[index].amount = aggregated[index].amount + change.amount;
			}
		}

		for (const change of outChanges) {
			const index = aggregated.findIndex(
				(c) => c.productId === change.productId && c.number === change.number
			);
			if (index === -1) {
				const indexWithoutNumber = aggregated.findIndex(
					(c) => c.productId === change.productId && !c.number
				);
				if (indexWithoutNumber > -1) {
					aggregated[index].amount = aggregated[index].amount - change.amount;
				} else {
					change.amount = change.amount * -1;
					aggregated.push(change);
				}
			} else {
				aggregated[index].amount = aggregated[index].amount - change.amount;
			}
		}

		return aggregated.filter((c) => c.amount !== 0);
	}
}
