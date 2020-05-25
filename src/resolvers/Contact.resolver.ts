import {
	PaginatedResponse,
	createResolver,
	resolveEntity,
	resolveEntityArray,
	PaginationArgs,
} from './helpers'
import Contact from '../entities/Contact'
import { Resolver, FieldResolver, Root, Query, Args, ObjectType, Authorized, Mutation, InputType, Field, Arg } from 'type-graphql'
import ContactType from '../entities/ContactType'
import ContactGroup from '../entities/ContactGroup'
import OrderCompensation from '../entities/OrderCompensation'
import CustomCompensation from '../entities/CustomCompensation'
import User from '../entities/User'
import CollectionPoint from '../entities/CollectionPoint'
import { getManager } from 'typeorm'
import { AuthRoles } from '../interfaces/AuthRoles'

const baseResolver = createResolver('Contact', Contact, [AuthRoles.CONTACTS_READ])

@InputType()
class EditContact implements Partial<Contact> {
	@Field()
	public id: number

	@Field({ nullable: true })
	public collectionPointId?: number

	@Field({ nullable: true })
	public entryDate?: Date

	@Field({ nullable: true })
	public exitDate?: Date

	@Field({ nullable: true })
	public bankName?: string

	@Field({ nullable: true })
	public iban?: string

	@Field({ nullable: true })
	public accountHolder?: string

	@Field(type => [String], { nullable: true })
	public moreMails?: string[]
}

@ObjectType(`PaginationResponseMember`)
class PaginationResponse extends PaginatedResponse(Contact) { }

@Resolver((of) => Contact)
export default class ContactResolver extends baseResolver {

	@Authorized([AuthRoles.CONTACTS_EDIT, AuthRoles.MEMBERS_EDIT])
	@Mutation(type => Contact)
	public async editContact(@Arg('data') data: EditContact): Promise<Contact> {
		const contact = await resolveEntity<Contact>('Contact', data.id)
		if (data.collectionPointId) {
			const collectionPoint = await resolveEntity<CollectionPoint>('CollectionPoint', data.collectionPointId)
			contact.collectionPoint = collectionPoint
		}

		for (const key of Object.keys(data)) {
			// @ts-ignore
			contact[key] = data[key]
		}

		return contact.save()
	}

	@Authorized([AuthRoles.MEMBERS_READ])
	@Query((type) => PaginationResponse)
	public async getMembers(@Args() { cursor, limit, sortBy, sortDirection }: PaginationArgs<Contact>): Promise<PaginationResponse> {
		const qb = getManager().getRepository(Contact).createQueryBuilder('contact')
		qb.leftJoinAndSelect('contact.contactGroups', 'contactGroup')
		qb.where('contactGroup.bexioId = :bexioId', { bexioId: 7 })
		qb.skip(cursor)
		if (limit) qb.take(limit)
		if (sortBy) qb.orderBy(`contact.${sortBy}`, sortDirection)

		const count = await getManager()
			.getRepository(Contact)
			.createQueryBuilder('contact')
			.leftJoinAndSelect('contact.contactGroups', 'contactGroup')
			.where('contactGroup.bexioId = :bexioId', { bexioId: 7 })
			.getCount()

		let nextCursor = cursor + (limit || 0)
		if (nextCursor > count) {
			nextCursor = count
		}
		return {
			total: count,
			cursor: nextCursor,
			hasMore: nextCursor !== count,
			items: await qb.getMany(),
		}
	}

	@Authorized([AuthRoles.MEMBERS_READ])
	@Query(type => [Contact])
	public async getMembersAll(): Promise<Contact[]> {
		const qb = getManager().getRepository(Contact).createQueryBuilder('contact')
		qb.leftJoinAndSelect('contact.contactGroups', 'contactGroup')
		qb.where('contactGroup.bexioId = :bexioId', { bexioId: 7 })

		return qb.getMany()
	}

	@FieldResolver()
	public async contactType(@Root() object: Contact): Promise<ContactType> {
		return resolveEntity('ContactType', object.contactTypeId)
	}

	@FieldResolver()
	public async contactGroups(@Root() object: Contact): Promise<ContactGroup[]> {
		return resolveEntityArray('ContactGroup', object.contactGroupIds)
	}

	@FieldResolver()
	public async compensations(
		@Root() object: Contact
	): Promise<Array<OrderCompensation | CustomCompensation>> {
		const order = await resolveEntityArray<any>('OrderCompensation', object.compensationIds)
		const custom = await resolveEntityArray<any>('CustomCompensation', object.compensationIds)
		return order.concat(custom) as Array<OrderCompensation | CustomCompensation>
	}

	@FieldResolver({ nullable: true })
	public async user(@Root() object: Contact): Promise<User | null> {
		if (!object.userId) return null
		return resolveEntity('User', object.userId)
	}

	@FieldResolver({ nullable: true })
	public async collectionPoint(@Root() object: Contact): Promise<CollectionPoint | null> {
		if (!object.collectionPointId) return null
		return resolveEntity('CollectionPoint', object.collectionPointId)
	}
}
