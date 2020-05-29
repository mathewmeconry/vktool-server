import { Resolver, Root, FieldResolver } from 'type-graphql';
import { createResolver, resolveEntity } from './helpers';
import Position from '../entities/Position';
import Order from '../entities/Order';
import { AuthRoles } from '../interfaces/AuthRoles'

const baseResolver = createResolver('Position', Position, [AuthRoles.ORDERS_READ]);

@Resolver((of) => Position)
export default class PositionResolver extends baseResolver {
	@FieldResolver()
	public async order(@Root() object: Position): Promise<Order> {
		return resolveEntity('Order', object.orderId);
	}
}
