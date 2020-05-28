import { createResolver, resolveEntity } from './helpers';
import CollectionPoint from '../entities/CollectionPoint';
import { Resolver, InputType, Field, Mutation, Arg, Authorized, Query } from 'type-graphql';
import { AuthRoles } from '../interfaces/AuthRoles';
import { getManager } from 'typeorm';

const baseResolver = createResolver(
	'CollectionPoint',
	CollectionPoint,
	[AuthRoles.COLLECTIONPOINT_READ],
	[],
	['name', 'address', 'postcode', 'city']
);

@InputType()
class AddCollectionPoint implements Partial<CollectionPoint> {
	@Field()
	public name: string;

	@Field()
	public address: string;

	@Field()
	public postcode: string;

	@Field()
	public city: string;
}

@InputType()
class EditCollectionPoint implements Partial<CollectionPoint> {
	@Field()
	public id: number;

	@Field({ nullable: true })
	public name?: string;

	@Field({ nullable: true })
	public address?: string;

	@Field({ nullable: true })
	public postcode?: string;

	@Field({ nullable: true })
	public city?: string;
}

@Resolver((of) => CollectionPoint)
export default class CollectionPointResolver extends baseResolver {
	@Authorized([AuthRoles.COLLECTIONPOINT_CREATE])
	@Mutation((type) => CollectionPoint)
	public async addCollectionPoint(@Arg('data') data: AddCollectionPoint): Promise<CollectionPoint> {
		const cp = new CollectionPoint(data.name, data.address, data.postcode, data.city);
		return cp.save();
	}

	@Authorized([AuthRoles.COLLECTIONPOINT_EDIT])
	@Mutation((type) => CollectionPoint)
	public async editCollectionPoint(
		@Arg('data') data: EditCollectionPoint
	): Promise<CollectionPoint> {
		const cp = await resolveEntity<CollectionPoint>('CollectionPoint', data.id);

		for (const key of Object.keys(data)) {
			// @ts-ignore
			cp[key] = data[key];
		}
		return cp.save();
	}

	@Authorized([AuthRoles.MEMBERS_EDIT, AuthRoles.COLLECTIONPOINT_READ])
	@Query((type) => [CollectionPoint])
	public async getCollectionPoints(): Promise<CollectionPoint[]> {
		return getManager().getRepository(CollectionPoint).find();
	}
}
