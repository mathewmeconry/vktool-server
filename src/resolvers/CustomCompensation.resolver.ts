import CustomCompensation from '../entities/CustomCompensation';
import { Resolver, Query, Arg, InputType, Field, Mutation, Ctx } from 'type-graphql';
import CompensationResolver from './Compensation.resolver';
import { resolveEntity } from './helpers';
import { ApolloContext } from '../controllers/CliController';
import Contact from '../entities/Contact';

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
	@Mutation((type) => CustomCompensation)
	public async addCustomCompensation(
		@Arg('data') data: AddCustomCompensation,
		@Ctx() ctx: ApolloContext
	): Promise<CustomCompensation> {
		const member = await resolveEntity<Contact>('Contact', data.memberId);
		const comp = new CustomCompensation(member, ctx.user, data.amount, data.date, data.description);
		return comp.save();
	}

	@Query((type) => CustomCompensation, { nullable: true })
	public async getCustomCompensation(@Arg('id') id: number): Promise<CustomCompensation | null> {
		return resolveEntity('CustomCompensation', id);
	}
}
