import { Resolver, Root, FieldResolver, Query, Authorized } from 'type-graphql';
import { createResolver, resolveEntity, resolveEntityArray } from './helpers';
import Contact from '../entities/Contact';
import Order from '../entities/Order';
import BillingReport from '../entities/BillingReport';
import { getManager } from 'typeorm';
import { AuthRoles } from '../interfaces/AuthRoles';
import Position from '../entities/Position';

const baseResolver = createResolver(
	'Order',
	Order,
	[AuthRoles.ORDERS_READ],
	['positions', 'contact'],
	['documentNr', 'title', 'contact.firstname', 'contact.lastname']
);

@Resolver((of) => Order)
export default class OrderResolver extends baseResolver {
	@Authorized([AuthRoles.BILLINGREPORTS_CREATE])
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
			.where('order.firstExecDate <= :greather', { greather: in15Days.toISOString() })
			.andWhere('order.firstExecDate >= :lower', {
				lower: before30Days.toISOString(),
			})
			.orderBy('order.title', 'ASC');
		let orders = await query.getMany();

		return orders;
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
