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
} from 'type-graphql';
import { getManager } from 'typeorm';
import { ApolloContext } from '../controllers/CliController';
import CustomCompensation from '../entities/CustomCompensation';
import MaterialChangelog from '../entities/MaterialChangelog';
import MaterialChangelogToProduct from '../entities/MaterialChangelogToProduct';
import Product from '../entities/Product';
import { AuthRoles } from '../interfaces/AuthRoles';
import AuthService from '../services/AuthService'
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

	@Authorized([AuthRoles.MATERIAL_CHANGELOG_EDIT])
	@Mutation((type) => MaterialChangelogToProduct)
	public async deleteMaterialChangelogToProduct(
		@Arg('id') id: number,
		@Ctx() ctx: ApolloContext
	): Promise<MaterialChangelogToProduct> {
		let mc2p = await resolveEntity<MaterialChangelogToProduct>('MaterialChangelogToProduct', id, [
			'compensation',
			'product',
		]);
		mc2p.deletedBy = ctx.user;
		await mc2p.save();

		const result = await getManager().getRepository(MaterialChangelogToProduct).softDelete(id);

		if (result.affected !== 1) {
			throw new GraphQLError(`Failed to delete mc2p ${mc2p.id}`);
		}

		if (mc2p.compensation) {
			mc2p.compensation.amount =
				mc2p.compensation.amount - mc2p.amount * (mc2p.product.salePrice || 0);
			await mc2p.compensation.save();
			mc2p.compensation = undefined;
			await mc2p.save();
		}
		return mc2p;
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
}
