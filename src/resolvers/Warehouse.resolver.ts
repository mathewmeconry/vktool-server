import { Arg, Authorized, Mutation, Resolver, Int, FieldResolver, Root, Query } from 'type-graphql';
import { getManager } from 'typeorm';
import Warehouse from '../entities/Warehouse';
import { AuthRoles } from '../interfaces/AuthRoles';
import { createResolver } from './helpers';

const baseResolver = createResolver('Warehouse', Warehouse, [AuthRoles.WAREHOUSE_READ]);

@Resolver((of) => Warehouse)
export default class WarehouseResolver extends baseResolver {
	@Authorized([AuthRoles.WAREHOUSE_CREATE])
	@Mutation((type) => Warehouse)
	public addWarehouse(
		@Arg('name') name: string,
		@Arg('maxWeight', (type) => Int, { nullable: true }) maxWeight?: number
	): Promise<Warehouse> {
		const warehouse = new Warehouse();
		warehouse.name = name;
		warehouse.maxWeight = maxWeight;
		return warehouse.save();
	}

	@Authorized([AuthRoles.WAREHOUSE_CREATE])
	@Mutation((type) => Warehouse)
	public async editWarehouse(
		@Arg('id', () => Int) id: number,
		@Arg('name') name: string,
		@Arg('maxWeight', (type) => Int, { nullable: true }) maxWeight?: number
	): Promise<Warehouse> {
		const warehouse = await getManager().getRepository(Warehouse).findOneOrFail(id);
		warehouse.name = name;
		warehouse.maxWeight = maxWeight;
		return warehouse.save();
	}

	@Authorized([AuthRoles.WAREHOUSE_READ, AuthRoles.MATERIAL_CHANGELOG_CREATE])
	@Query((type) => [Warehouse])
	public async getWarehousesAll(): Promise<Warehouse[]> {
		const qb = getManager()
			.getRepository(Warehouse)
			.createQueryBuilder('warehouse')
			.orderBy('warehouse.name', 'ASC');

		return qb.getMany();
	}
}
