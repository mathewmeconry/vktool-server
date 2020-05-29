import {
	ManyToOne,
	Entity,
	JoinColumn,
	Column,
	OneToOne,
	AfterLoad,
	RelationId,
	Index,
} from 'typeorm';
import { IsOptional, IsDate, IsString, Validate } from 'class-validator';
import CollectionPoint from './CollectionPoint';
import Contact from './Contact';
import Base from './Base';
import User from './User';
import { ObjectType, Field } from 'type-graphql';

// needs to be kept in sync with class...
export enum ContactExtensionInterface {
	collectionPointId,
	collectionPoint,
	entryDate,
	exitDate,
	bankName,
	iban,
	accountHolder,
	moreMails,
}

@ObjectType()
@Entity()
export default class ContactExtension extends Base<ContactExtension> {
	@OneToOne((type) => Contact, (contact) => contact.extension)
	@JoinColumn()
	public contact: Contact;

	@Field()
	@RelationId('contact')
	public contactId: number;

	@ManyToOne((type) => CollectionPoint, { nullable: true })
	@JoinColumn()
	public collectionPoint?: CollectionPoint;

	@Field()
	@RelationId('collectionPoint')
	public collectionPointId?: number;

	@Field()
	@Column('datetime', { nullable: true })
	public entryDate?: Date;

	@Field()
	@Column('datetime', { nullable: true })
	public exitDate?: Date;

	@Field()
	@Column('text', { nullable: true })
	public bankName?: string;

	@Index({ fulltext: true })
	@Field()
	@Column('text', { nullable: true })
	public iban?: string;

	@Field()
	@Column('text', { nullable: true })
	public accountHolder?: string;

	@Index({ fulltext: true })
	@Field((type) => [String])
	@Column('simple-array', { nullable: true })
	public moreMails?: Array<string>;

	@ManyToOne((type) => User)
	@JoinColumn()
	public updatedBy: User;

	@Field()
	@RelationId('updatedBy')
	public updatedById: number;

	@AfterLoad()
	public parseDates() {
		for (let i in this) {
			if (i.toLocaleLowerCase().indexOf('date') > -1) {
				//@ts-ignore
				this[i] = this[i] ? new Date(this[i]) : this[i];
			}
		}
	}
}
