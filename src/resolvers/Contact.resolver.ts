import PaginatedResponse, {
	createResolver,
	resolveEntity,
	resolveEntityArray,
	PaginationArgs,
} from './helpers';
import Contact from '../entities/Contact';
import { Resolver, FieldResolver, Root, Query, Args, ObjectType } from 'type-graphql';
import ContactType from '../entities/ContactType';
import ContactGroup from '../entities/ContactGroup';
import OrderCompensation from '../entities/OrderCompensation';
import CustomCompensation from '../entities/CustomCompensation';
import User from '../entities/User';
import CollectionPoint from '../entities/CollectionPoint';
import { getManager } from 'typeorm';

const baseResolver = createResolver('Contact', Contact);

@ObjectType(`PaginationResponseMember`)
class PaginationResponse extends PaginatedResponse(Contact) {}

@Resolver((of) => Contact)
export default class ContactResolver extends baseResolver {
	@Query((type) => PaginationResponse)
	public async getMembers(@Args() { cursor, limit }: PaginationArgs): Promise<PaginationResponse> {
		const qb = getManager().getRepository(Contact).createQueryBuilder('contact');
		qb.leftJoinAndSelect('contact.contactGroups', 'contactGroup');
		qb.where('contactGroup.bexioId = :bexioId', { bexioId: 7 });
		qb.skip(cursor);
		if (limit) qb.take(limit);

		const count = await getManager()
			.getRepository(Contact)
			.createQueryBuilder('contact')
			.leftJoinAndSelect('contact.contactGroups', 'contactGroup')
			.where('contactGroup.bexioId = :bexioId', { bexioId: 7 })
			.getCount();

		let nextCursor = cursor + (limit || 0);
		if (nextCursor > count) {
			nextCursor = count;
		}
		return {
			total: count,
			cursor: nextCursor,
			hasMore: nextCursor !== count,
			items: await qb.getMany(),
		};
	}

	@FieldResolver()
	public async contactType(@Root() object: Contact): Promise<ContactType> {
		return resolveEntity('ContactType', object.contactTypeId);
	}

	@FieldResolver()
	public async contactGroups(@Root() object: Contact): Promise<ContactGroup[]> {
		return resolveEntityArray('ContactGroup', object.contactGroupIds);
	}

	@FieldResolver()
	public async compensations(
		@Root() object: Contact
	): Promise<Array<OrderCompensation | CustomCompensation>> {
		const order = await resolveEntityArray<any>('OrderCompensation', object.compensationIds);
		const custom = await resolveEntityArray<any>('CustomCompensation', object.compensationIds);
		return order.concat(custom) as Array<OrderCompensation | CustomCompensation>;
	}

	@FieldResolver({ nullable: true })
	public async user(@Root() object: Contact): Promise<User | null> {
		if (!object.userId) return null;
		return resolveEntity('User', object.userId);
	}

	@FieldResolver({ nullable: true })
	public async collectionPoint(@Root() object: Contact): Promise<CollectionPoint | null> {
		if (!object.collectionPointId) return null;
		return resolveEntity('CollectionPoint', object.collectionPointId);
	}
}
