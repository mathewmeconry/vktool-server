import { Resolver, Root, FieldResolver, Query, Authorized } from 'type-graphql';
import { createResolver, resolveEntity, resolveEntityArray } from './helpers';
import Contact from '../entities/Contact';
import Order from '../entities/Order';
import BillingReport from '../entities/BillingReport';
import { getManager } from 'typeorm';
import { AuthRoles } from '../interfaces/AuthRoles'

const baseResolver = createResolver('Order', Order, [AuthRoles.ORDERS_READ]);

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

		let orders = await getManager()
			.getRepository(Order)
			.createQueryBuilder('order')
			.where('order.validFrom <= :date', { date: now.toISOString() })
			.getMany();

		orders = orders.filter((order) =>
			order.execDates.find((execDate) => {
				return execDate > before30Days && execDate < in15Days;
			})
		);

		return orders.filter((order) => order.execDates.length >= (order.billingReports || []).length);
	}

	@FieldResolver()
	public async contact(@Root() object: Order): Promise<Contact> {
		return resolveEntity('Contact', object.contactId);
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
