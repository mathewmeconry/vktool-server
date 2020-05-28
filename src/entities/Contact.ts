import {
	Entity,
	Column,
	OneToMany,
	JoinColumn,
	ManyToOne,
	ManyToMany,
	OneToOne,
	JoinTable,
	AfterLoad,
	getManager,
	BeforeUpdate,
	BeforeInsert,
	AfterInsert,
	AfterUpdate,
	RelationId,
	Index,
} from 'typeorm';
import BexioBase from './BexioBase';
import Compensation from './Compensation';
import User from './User';
import ContactType from './ContactType';
import ContactGroup from './ContactGroup';
import CollectionPoint from './CollectionPoint';
import ContactExtension, { ContactExtensionInterface } from './ContactExtension';
import { IsString, IsDate, IsOptional, IsEmail, IsPhoneNumber } from 'class-validator';
import { ObjectType, Field, Int, Authorized } from 'type-graphql';
import { AuthRoles } from '../interfaces/AuthRoles';

@ObjectType()
@Entity()
export default class Contact extends BexioBase<Contact> {
	@Field()
	@Column('text')
	public nr: string;

	@Field((type) => ContactType)
	@ManyToOne((type) => ContactType)
	@JoinColumn()
	public contactType: ContactType;

	@RelationId('contactType')
	public contactTypeId: number;

	@Index({ fulltext: true })
	@Field()
	@Column('text')
	public firstname: string;

	@Index({ fulltext: true })
	@Field()
	@Column('text')
	public lastname: string;

	@Field()
	@Column('datetime')
	public birthday: Date;

	@Index({ fulltext: true })
	@Field()
	@Column('text')
	public address: string;

	@Index({ fulltext: true })
	@Field()
	@Column('text')
	public postcode: string;

	@Index({ fulltext: true })
	@Field()
	@Column('text')
	public city: string;

	@Index({ fulltext: true })
	@Field()
	@Column('text')
	public mail: string;

	@Index({ fulltext: true })
	@Field({ nullable: true })
	@Column('text', { nullable: true })
	public mailSecond?: string;

	@Index({ fulltext: true })
	@Field({ nullable: true })
	@Column('text', { nullable: true })
	public phoneFixed?: string;

	@Index({ fulltext: true })
	@Field({ nullable: true })
	@Column('text', { nullable: true })
	public phoneFixedSecond?: string;

	@Index({ fulltext: true })
	@Field({ nullable: true })
	@Column('text', { nullable: true })
	public phoneMobile?: string;

	@Field({ nullable: true })
	@Column('text', { nullable: true })
	public remarks?: string;

	@Field((type) => [ContactGroup])
	@ManyToMany((type) => ContactGroup)
	@JoinTable()
	public contactGroups: Array<ContactGroup>;

	@RelationId('contactGroups')
	public contactGroupIds: number[];

	@Field()
	@Column('int')
	public ownerId: number;

	@Authorized([AuthRoles.COMPENSATIONS_READ])
	@Field((type) => [Compensation])
	@OneToMany((type) => Compensation, (compensation) => compensation.member, { nullable: true })
	public compensations: Promise<Array<Compensation<any>>>;

	@RelationId('compensations')
	public compensationIds: number[];

	@Authorized([AuthRoles.ADMIN])
	@Field((type) => User, { nullable: true })
	@OneToOne((type) => User, (user) => user.bexioContact, { nullable: true })
	public user?: User;

	@RelationId('user')
	public userId?: number;

	// custom fields stored in contactExtension entity
	@Field({ nullable: true })
	public rank?: string;

	@Field((type) => [String], { nullable: true })
	public functions?: Array<string>;

	public isMember(): boolean {
		return this.contactGroups.find((group) => group.bexioId === 7) ? true : false;
	}

	public async getRank(): Promise<ContactGroup | null> {
		const rankGroups = [17, 13, 11, 12, 28, 29, 15, 27, 26, 10, 14, 33, 22];

		let groups = this.contactGroups;
		if (!groups) {
			groups = await getManager()
				.getRepository<ContactGroup>(ContactGroup)
				.createQueryBuilder()
				.where('id IN (:ids)', { ids: this.contactGroupIds })
				.getMany();
		}

		if (groups) {
			return groups.find((group) => rankGroups.indexOf(group.bexioId) > -1) || null;
		}

		return null;
	}

	public async getFunctions(): Promise<Array<ContactGroup>> {
		const functionGroups = [9, 16, 32, 16];

		let groups = this.contactGroups;
		if (!groups) {
			groups = await getManager()
				.getRepository<ContactGroup>(ContactGroup)
				.createQueryBuilder()
				.where('id IN (:ids)', { ids: this.contactGroupIds })
				.getMany();
		}


		if (groups) {
			return groups.filter((group) => functionGroups.indexOf(group.bexioId) > -1);
		}

		return [];
	}

	public async save(): Promise<Contact> {
		await super.save();
		return this;
	}

	@AfterLoad()
	public async loadOverride(): Promise<boolean> {
		this.ajustDates();

		return true;
	}

	private ajustDates(): void {
		this.birthday = new Date(this.birthday);
	}
}
