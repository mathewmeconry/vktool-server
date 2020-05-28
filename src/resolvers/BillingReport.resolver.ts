import {
	Resolver,
	FieldResolver,
	Root,
	Args,
	Arg,
	registerEnumType,
	Mutation,
	Ctx,
	InputType,
	Field,
	Authorized,
	Int,
	ForbiddenError,
} from 'type-graphql';
import BillingReport, { BillingReportState } from '../entities/BillingReport';
import { createResolver, resolveEntity, resolveEntityArray } from './helpers';
import User from '../entities/User';
import Order from '../entities/Order';
import OrderCompensation from '../entities/OrderCompensation';
import Contact from '../entities/Contact';
import { getManager } from 'typeorm';
import { ApolloContext } from '../controllers/CliController';
import { AuthRoles } from '../interfaces/AuthRoles';
import AuthService from '../services/AuthService';

const baseResolver = createResolver(
	'BillingReport',
	BillingReport,
	[AuthRoles.BILLINGREPORTS_READ],
	['order', 'creator'],
	['state', 'creator.displayName', 'order.documentNr', 'order.title']
);

registerEnumType(BillingReportState, {
	name: 'BillingReportState',
	description: 'Possilbe states for billingReports',
});

@InputType()
class AddBillingReportInput implements Partial<BillingReport> {
	@Field()
	public orderId: number;

	@Field()
	public date: Date;

	@Field((type) => [Number])
	public elIds: number[];

	@Field((type) => [Number])
	public driverIds: number[];

	@Field()
	public food: boolean;

	@Field({ nullable: true })
	public remarks?: string;
}

@InputType()
class EditBillingReportInput implements Partial<BillingReport> {
	@Field()
	public id: number;

	@Field({ nullable: true })
	public orderId?: number;

	@Field({ nullable: true })
	public date?: Date;

	@Field((type) => [Number], { nullable: true })
	public elIds?: number[];

	@Field((type) => [Number], { nullable: true })
	public driverIds?: number[];

	@Field({ nullable: true })
	public food?: boolean;

	@Field({ nullable: true })
	public remarks?: string;
}

@Resolver((of) => BillingReport)
export default class BillingReportResolver extends baseResolver {
	@Authorized([AuthRoles.BILLINGREPORTS_EDIT, AuthRoles.BILLINGREPORTS_CREATE])
	@Mutation((type) => BillingReport)
	public async editBillingReport(
		@Arg('data') data: EditBillingReportInput,
		@Ctx() ctx: ApolloContext
	): Promise<BillingReport> {
		const br = await resolveEntity<BillingReport>('BillingReport', data.id);

		if (!AuthService.isAuthorized(ctx.user.roles, AuthRoles.BILLINGREPORTS_EDIT)) {
			if (br.creatorId !== ctx.user.id || br.state !== BillingReportState.PENDING) {
				throw new ForbiddenError();
			}
		}

		if (data.orderId) {
			const order = await resolveEntity<Order>('Order', data.orderId);
			br.order = order;
		}

		if (data.elIds) {
			const els = await resolveEntityArray<Contact>('Contact', data.elIds);
			br.els = els;
		}

		if (data.driverIds) {
			const drivers = await resolveEntityArray<Contact>('Contact', data.driverIds);
			br.drivers = drivers;
		}

		for (const key of Object.keys(data)) {
			// @ts-ignore
			br[key] = data[key];
		}
		br.updatedBy = ctx.user;

		return br.save();
	}

	@Authorized([AuthRoles.BILLINGREPORTS_CREATE])
	@Mutation((type) => BillingReport)
	public async addBillingReport(
		@Arg('data') data: AddBillingReportInput,
		@Ctx() ctx: ApolloContext
	): Promise<BillingReport> {
		const order = await resolveEntity<Order>('Order', data.orderId);
		const els = await resolveEntityArray<Contact>('Contact', data.elIds);
		const drivers = await resolveEntityArray<Contact>('Contact', data.driverIds);

		// @ts-ignore
		const br = new BillingReport(
			ctx.user,
			order,
			data.date,
			[],
			els,
			drivers,
			data.food,
			data.remarks || '',
			BillingReportState.PENDING
		);

		return br.save();
	}

	@Authorized([AuthRoles.BILLINGREPORTS_APPROVE])
	@Mutation((type) => BillingReport)
	public async changeBillingReportState(
		@Arg('id', (type) => Int) id: number,
		@Arg('state', (type) => BillingReportState) state: BillingReportState,
		@Ctx() ctx: ApolloContext
	): Promise<BillingReport> {
		const br = await getManager()
			.getRepository(BillingReport)
			.createQueryBuilder('billingReport')
			.where('billingReport.id = :id', { id })
			.getOne();

		if (!br) throw new Error('BillingReport not found');

		await getManager()
			.createQueryBuilder()
			.update(OrderCompensation)
			.set({ approved: state === BillingReportState.APPROVED, updatedBy: ctx.user })
			.where('billingReport = :id', { id: br.id })
			.andWhere('deletedAt IS NULL')
			.execute();

		if (state === BillingReportState.APPROVED) {
			br.approvedBy = ctx.user;
		} else {
			br.approvedBy = undefined;
		}
		br.state = state;
		br.updatedBy = ctx.user;

		return br.save();
	}

	@FieldResolver()
	public async creator(@Root() object: BillingReport): Promise<User> {
		return resolveEntity('User', object.creatorId);
	}

	@FieldResolver()
	public async order(@Root() object: BillingReport): Promise<Order> {
		return resolveEntity('Order', object.orderId);
	}

	@FieldResolver()
	public async compensations(@Root() object: BillingReport): Promise<OrderCompensation[]> {
		return resolveEntityArray('OrderCompensation', object.compensationIds);
	}

	@FieldResolver()
	public async els(@Root() object: BillingReport): Promise<Contact[]> {
		return resolveEntityArray('Contact', object.elIds);
	}

	@FieldResolver()
	public async drivers(@Root() object: BillingReport): Promise<Contact[]> {
		return resolveEntityArray('Contact', object.driverIds);
	}

	@FieldResolver({ nullable: true })
	public async approvedBy(@Root() object: BillingReport): Promise<User | null> {
		if (object.approvedById) {
			return resolveEntity('User', object.approvedById);
		}
		return null;
	}

	@FieldResolver()
	public async updatedBy(@Root() object: BillingReport): Promise<User> {
		return resolveEntity('User', object.updatedById);
	}
}
