import { Arg, Authorized, FieldResolver, ID, Query, Resolver, Root } from 'type-graphql';
import { getManager } from 'typeorm';
import Warehouse from '../entities/Warehouse';
import { MaterialChangelog2WarehouseView } from '../entities/MaterialChangelog2WarehouseView';
import Product from '../entities/Product';
import { AuthRoles } from '../interfaces/AuthRoles';

@Resolver((of) => MaterialChangelog2WarehouseView)
export default class MaterialChangelog2WarehouseViewResolver {
	@Authorized([AuthRoles.WAREHOUSE_READ])
	@Query((returns) => [MaterialChangelog2WarehouseView], { nullable: true })
	public async getWarehouseStock(
		@Arg('warehouseId', () => ID) warehouseId: number
	): Promise<MaterialChangelog2WarehouseView[]> {
		return await getManager().getRepository(MaterialChangelog2WarehouseView).find({
			where: { warehouseId },
		});
	}

	@FieldResolver((type) => Product)
	async product(@Root() materialChangelog2WarehouseView: MaterialChangelog2WarehouseView) {
		return await getManager()
			.getRepository(Product)
			.findOne({
				where: { id: materialChangelog2WarehouseView.productId },
			});
	}

	@FieldResolver((type) => Warehouse)
	async warehouse(@Root() materialChangelog2WarehouseView: MaterialChangelog2WarehouseView) {
		return await getManager()
			.getRepository(Warehouse)
			.findOne({
				where: { id: materialChangelog2WarehouseView.warehouseId },
			});
	}
}
