import OrderCompensation from '../entities/OrderCompensation';
import {
	Resolver,
	FieldResolver,
	Root,
	Query,
	Arg,
	InputType,
	Mutation,
	Ctx,
	Field,
	Authorized,
	ArgsType,
	Int,
	Args,
	ObjectType,
} from 'type-graphql';
import { resolveEntity, PaginationArgs, PaginatedResponse } from './helpers';
import BillingReport from '../entities/BillingReport';
import CompensationResolver from './Compensation.resolver';
import { ApolloContext } from '../controllers/CliController';
import Contact from '../entities/Contact';
import { AuthRoles } from '../interfaces/AuthRoles';
import { getManager } from 'typeorm';

@InputType()
class AddOrderCompensation implements Partial<OrderCompensation> {
	@Field()
	public from: Date;

	@Field()
	public until: Date;

	@Field()
	public billingReportId: number;

	@Field()
	public memberId: number;

	@Field()
	public date: Date;
}

@Resolver((of) => OrderCompensation)
export default class OrderCompensationResolver extends CompensationResolver {
	@Authorized([AuthRoles.COMPENSATIONS_CREATE])
	@Mutation((type) => [OrderCompensation])
	public async addOrderCompensations(
		@Arg('data', (type) => [AddOrderCompensation]) data: AddOrderCompensation[],
		@Ctx() ctx: ApolloContext
	): Promise<OrderCompensation[]> {
		const storePromises: Promise<OrderCompensation>[] = [];
		for (const add of data) {
			const member = await resolveEntity<Contact>('Contact', add.memberId);
			const bt = await resolveEntity<BillingReport>('BillingReport', add.billingReportId);

			const comp = new OrderCompensation(member, ctx.user, add.date, bt, add.from, add.until);
			storePromises.push(comp.save());
		}

		return Promise.all(storePromises);
	}

	@Authorized([AuthRoles.COMPENSATIONS_CREATE])
	@Mutation((type) => OrderCompensation)
	public async addOrderCompensation(
		@Arg('data') data: AddOrderCompensation,
		@Ctx() ctx: ApolloContext
	): Promise<OrderCompensation> {
		const member = await resolveEntity<Contact>('Contact', data.memberId);
		const bt = await resolveEntity<BillingReport>('BillingReport', data.billingReportId);

		const comp = new OrderCompensation(member, ctx.user, data.date, bt, data.from, data.until);
		return comp.save();
	}

	@Authorized([AuthRoles.COMPENSATIONS_READ])
	@Query((type) => OrderCompensation, { nullable: true })
	public async getOrderCompensation(
		@Arg('id', (type) => Int) id: number
	): Promise<OrderCompensation | null> {
		try {
			return await resolveEntity('OrderCompensation', id);
		} catch (e) {
			return null;
		}
	}

	@FieldResolver()
	public async billingReport(@Root() object: OrderCompensation): Promise<BillingReport> {
		return resolveEntity('BillingReport', object.billingReportId);
	}
}
