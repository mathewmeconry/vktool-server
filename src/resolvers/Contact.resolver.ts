import {
	PaginatedResponse,
	createResolver,
	resolveEntity,
	resolveEntityArray,
	PaginationArgs,
} from './helpers';
import Contact from '../entities/Contact';
import {
	Resolver,
	FieldResolver,
	Root,
	Query,
	Args,
	ObjectType,
	Authorized,
	Mutation,
	InputType,
	Field,
	Arg,
} from 'type-graphql';
import ContactType from '../entities/ContactType';
import ContactGroup from '../entities/ContactGroup';
import OrderCompensation from '../entities/OrderCompensation';
import CustomCompensation from '../entities/CustomCompensation';
import User from '../entities/User';
import CollectionPoint from '../entities/CollectionPoint';
import { getManager, FindManyOptions } from 'typeorm';
import { AuthRoles } from '../interfaces/AuthRoles';
import ContactExtension from '../entities/ContactExtension';

const baseResolver = createResolver(
	'Contact',
	Contact,
	[AuthRoles.CONTACTS_READ],
	['contactGroups']
);

@InputType()
class EditContact implements Partial<Contact> {
	@Field()
	public id: number;

	@Field({ nullable: true })
	public collectionPointId?: number;

	@Field({ nullable: true })
	public entryDate?: Date;

	@Field({ nullable: true })
	public exitDate?: Date;

	@Field({ nullable: true })
	public bankName?: string;

	@Field({ nullable: true })
	public iban?: string;

	@Field({ nullable: true })
	public accountHolder?: string;

	@Field((type) => [String], { nullable: true })
	public moreMails?: string[];
}

@ObjectType(`PaginationResponseMember`)
class PaginationResponse extends PaginatedResponse(Contact) {}

@Resolver((of) => Contact)
export default class ContactResolver extends baseResolver {
	@Authorized([AuthRoles.CONTACTS_EDIT, AuthRoles.MEMBERS_EDIT])
	@Mutation((type) => ContactExtension)
	public async editContact(@Arg('data') data: EditContact): Promise<ContactExtension> {
		let contact: ContactExtension | undefined;
		contact = await getManager()
			.getRepository(ContactExtension)
			.findOne({ where: { contact: data.id } });

		if (!contact) {
			contact = new ContactExtension();
		}
		if (data.collectionPointId) {
			const collectionPoint = await resolveEntity<CollectionPoint>(
				'CollectionPoint',
				data.collectionPointId
			);
			contact.collectionPoint = collectionPoint;
		}

		for (const key of Object.keys(data)) {
			if (key !== 'id') {
				// @ts-ignore
				contact[key] = data[key];
			}
		}

		return contact.save();
	}

	@Authorized([AuthRoles.MEMBERS_READ])
	@Query((type) => PaginationResponse)
	public async getMembers(
		@Args() { cursor, limit, sortBy, sortDirection }: PaginationArgs<Contact>
	): Promise<PaginationResponse> {
		const qb = getManager()
			.getRepository(Contact)
			.createQueryBuilder('Contact')
			.leftJoin('Contact.contactGroups', 'contactGroup')
			.where('contactGroup.bexioId = :bexioId', { bexioId: 7 });

		const count = await qb.getCount();

		qb.skip(cursor);
		if (limit) qb.take(limit);
		if (sortBy) {
			qb.orderBy(`Contact.${sortBy}`, sortDirection);
		}

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

	@Authorized([AuthRoles.MEMBERS_READ])
	@Query((type) => [Contact])
	public async getMembersAll(): Promise<Contact[]> {
		const qb = getManager()
			.getRepository(Contact)
			.createQueryBuilder('contact')
			.leftJoin('contact.contactGroups', 'contactGroup')
			.where('contactGroup.bexioId = :bexioId', { bexioId: 7 })
			.orderBy('contact.firstname', 'ASC');

		return qb.getMany();
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
	public async rank(@Root() object: Contact): Promise<string | undefined> {
		return (await object.getRank())?.name;
	}

	@FieldResolver((type) => [String], { nullable: true })
	public async functions(@Root() object: Contact): Promise<string[] | undefined> {
		return (await object.getFunctions())?.map((g) => g.name);
	}

	@Authorized([AuthRoles.CONTACTS_READ])
	@FieldResolver((type) => CollectionPoint, { nullable: true })
	public async collectionPoint(@Root() object: Contact): Promise<CollectionPoint | null> {
		const extension = await this.loadExtension(object.id);
		if (!extension?.collectionPointId) return null;
		return resolveEntity('CollectionPoint', extension.collectionPointId);
	}

	@Authorized([AuthRoles.CONTACTS_READ])
	@FieldResolver((type) => Date, { nullable: true })
	public async entryDate(@Root() object: Contact): Promise<Date | undefined> {
		return (await this.loadExtension(object.id))?.entryDate;
	}

	@Authorized([AuthRoles.CONTACTS_READ])
	@FieldResolver((type) => Date, { nullable: true })
	public async exitDate(@Root() object: Contact): Promise<Date | undefined> {
		return (await this.loadExtension(object.id))?.exitDate;
	}

	@Authorized([AuthRoles.CONTACTS_READ])
	@FieldResolver((type) => String, { nullable: true })
	public async bankName(@Root() object: Contact): Promise<string | undefined> {
		return (await this.loadExtension(object.id))?.bankName;
	}

	@Authorized([AuthRoles.CONTACTS_READ])
	@FieldResolver((type) => String, { nullable: true })
	public async iban(@Root() object: Contact): Promise<string | undefined> {
		return (await this.loadExtension(object.id))?.iban;
	}

	@Authorized([AuthRoles.CONTACTS_READ])
	@FieldResolver((type) => String, { nullable: true })
	public async accountHolder(@Root() object: Contact): Promise<string | undefined> {
		return (await this.loadExtension(object.id))?.accountHolder;
	}

	@Authorized([AuthRoles.CONTACTS_READ])
	@FieldResolver((type) => [String], { nullable: true })
	public async moreMails(@Root() object: Contact): Promise<string[] | undefined> {
		return (await this.loadExtension(object.id))?.moreMails;
	}

	private async loadExtension(contactId: number): Promise<ContactExtension | undefined> {
		return getManager()
			.getRepository(ContactExtension)
			.findOne({ where: { contact: contactId } });
	}
}
