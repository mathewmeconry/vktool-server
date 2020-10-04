import CustomCompensation from '../entities/CustomCompensation';
import {
	Resolver,
	Query,
	Arg,
	InputType,
	Field,
	Mutation,
	Ctx,
	Authorized,
	Int,
	Root,
	FieldResolver,
} from 'type-graphql';
import CompensationResolver from './Compensation.resolver';
import { resolveEntity, resolveEntityArray } from './helpers';
import { ApolloContext } from '../controllers/CliController';
import Contact from '../entities/Contact';
import { AuthRoles } from '../interfaces/AuthRoles';
import MaterialChangelog from '../entities/MaterialChangelog';
import MaterialChangelogToProduct from '../entities/MaterialChangelogToProduct';
import { getManager } from 'typeorm';

@InputType()
class AddCustomCompensation implements Partial<CustomCompensation> {
	@Field()
	public description: string;

	@Field()
	public memberId: number;

	@Field()
	public amount: number;

	@Field()
	public date: Date;
}

@Resolver((of) => CustomCompensation)
export default class CustomCompensationResolver extends CompensationResolver {
	@Authorized([AuthRoles.COMPENSATIONS_CREATE])
	@Mutation((type) => CustomCompensation)
	public async addCustomCompensation(
		@Arg('data') data: AddCustomCompensation,
		@Ctx() ctx: ApolloContext
	): Promise<CustomCompensation> {
		const member = await resolveEntity<Contact>('Contact', data.memberId);
		const comp = new CustomCompensation(member, ctx.user, data.amount, data.date, data.description);
		return comp.save();
	}

	@Authorized([AuthRoles.COMPENSATIONS_READ])
	@Query((type) => CustomCompensation, { nullable: true })
	public async getCustomCompensation(
		@Arg('id', (type) => Int) id: number
	): Promise<CustomCompensation | null> {
		try {
			return await resolveEntity('CustomCompensation', id);
		} catch (e) {
			return null;
		}
	}

	@Authorized([AuthRoles.MATERIAL_CHANGELOG_READ])
	@FieldResolver((type) => [MaterialChangelogToProduct], { nullable: true })
	public async materialChangelogToProducts(
		@Root() object: CustomCompensation
	): Promise<MaterialChangelogToProduct[] | null> {
		if (object.materialChangelogToProductsIds && object.materialChangelogToProductsIds.length > 0) {
			try {
				return resolveEntityArray(
					'MaterialChangelogToProduct',
					object.materialChangelogToProductsIds,
					['product']
				);
			} catch (e) {
				return null;
			}
		}
		return null;
	}
}
