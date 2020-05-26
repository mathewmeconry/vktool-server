import { Resolver, Root, FieldResolver, Query, Authorized } from 'type-graphql';
import { createResolver, resolveEntity, resolveEntityArray } from './helpers';
import Contact from '../entities/Contact';
import Order from '../entities/Order';
import BillingReport from '../entities/BillingReport';
import { getManager } from 'typeorm';
import { AuthRoles } from '../interfaces/AuthRoles';
import moment from 'moment';

const baseResolver = createResolver('Order', Order, [AuthRoles.ORDERS_READ], ['positions']);

@Resolver((of) => Order)
export default class OrderResolver extends baseResolver {
	@Authorized([AuthRoles.ORDERS_READ])
	@Query((type) => [Order])
	public async getOpenOrders(): Promise<Order[]> {
		let now = new Date();
		let before30Days = new Date();
		before30Days.setDate(before30Days.getDate() - 30);
		let in15Days = new Date();
		in15Days.setDate(in15Days.getDate() + 15);

		const query = getManager()
			.getRepository(Order)
			.createQueryBuilder('order')
			.leftJoinAndSelect('order.positions', 'positions')
			.where('order.validFrom <= :greather', { greather: now.toISOString() })
			.andWhere('order.validFrom >= :lower', {
				lower: moment(new Date()).startOf('year').subtract(1, 'year').toISOString(),
			});
		let orders = await query.getMany();

		orders = orders.filter((order) =>
			order.execDates.find((execDate) => {
				return execDate > before30Days && execDate < in15Days;
			})
		);

		return orders.filter((order) => order.execDates.length >= (order.billingReports || []).length);
	}

	@FieldResolver((type) => Contact, { nullable: true })
	public async contact(@Root() object: Order): Promise<Contact | null> {
		if (!object.contactId) {
			return null;
		}

		try {
			return await resolveEntity('Contact', object.contactId);
		} catch (e) {
			return null;
		}
	}

	@FieldResolver()
	public async positions(@Root() object: Order): Promise<Position[]> {
		return resolveEntityArray('Position', object.positionIds);
	}

	@FieldResolver()
	public async billingReports(@Root() object: Order): Promise<BillingReport[]> {
		if (!object.billingReportIds) return [];
		return resolveEntityArray('BillingReport', object.billingReportIds);
	}
}
