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
} from 'typeorm'
import BexioBase from './BexioBase'
import Compensation from './Compensation'
import User from './User'
import ContactType from './ContactType'
import ContactGroup from './ContactGroup'
import CollectionPoint from './CollectionPoint'
import ContactExtension, { ContactExtensionInterface } from './ContactExtension'
import { IsString, IsDate, IsOptional, IsEmail, IsPhoneNumber } from 'class-validator'
import { ObjectType, Field, Int, Authorized } from 'type-graphql'
import { AuthRoles } from '../interfaces/AuthRoles'

@ObjectType()
@Entity()
export default class Contact extends BexioBase<Contact> {
	@Field()
	@Column('text')
	public nr: string

	@Field((type) => ContactType)
	@ManyToOne((type) => ContactType)
	@JoinColumn()
	public contactType: ContactType

	@RelationId('contactType')
	public contactTypeId: number

	@Field()
	@Column('text')
	public firstname: string

	@Field()
	@Column('text')
	public lastname: string

	@Field()
	@Column('datetime')
	public birthday: Date

	@Field()
	@Column('text')
	public address: string

	@Field()
	@Column('text')
	public postcode: string

	@Field()
	@Column('text')
	public city: string

	@Field()
	@Column('text')
	public mail: string

	@Field({ nullable: true })
	@Column('text', { nullable: true })
	public mailSecond?: string

	@Field({ nullable: true })
	@Column('text', { nullable: true })
	public phoneFixed?: string

	@Field({ nullable: true })
	@Column('text', { nullable: true })
	public phoneFixedSecond?: string

	@Field({ nullable: true })
	@Column('text', { nullable: true })
	public phoneMobile?: string

	@Field({ nullable: true })
	@Column('text', { nullable: true })
	public remarks?: string

	@Field((type) => [ContactGroup])
	@ManyToMany((type) => ContactGroup)
	@JoinTable()
	public contactGroups: Array<ContactGroup>

	@RelationId('contactGroups')
	public contactGroupIds: number[]

	@Field()
	@Column('int')
	public ownerId: number

	@Authorized([AuthRoles.COMPENSATIONS_READ])
	@Field((type) => [Compensation])
	@OneToMany((type) => Compensation, (compensation) => compensation.member, { nullable: true })
	public compensations: Promise<Array<Compensation<any>>>

	@RelationId('compensations')
	public compensationIds: number[]

	@Authorized([AuthRoles.ADMIN])
	@Field((type) => User, { nullable: true })
	@OneToOne((type) => User, (user) => user.bexioContact, { nullable: true })
	public user?: User

	@RelationId('user')
	public userId?: number

	// custom fields stored in contactExtension entity
	@Field({ nullable: true })
	public rank?: string

	@Field((type) => [String], { nullable: true })
	public functions?: Array<string>

	@Field((type) => CollectionPoint, { nullable: true })
	public collectionPoint?: CollectionPoint

	public collectionPointId?: number

	@Authorized([AuthRoles.CONTACTS_READ])
	@Field({ nullable: true })
	public entryDate?: Date

	@Authorized([AuthRoles.CONTACTS_READ])
	@Field({ nullable: true })
	public exitDate?: Date

	@Authorized([AuthRoles.CONTACTS_READ])
	@Field({ nullable: true })
	public bankName?: string

	@Authorized([AuthRoles.CONTACTS_READ])
	@Field({ nullable: true })
	public iban?: string

	@Authorized([AuthRoles.CONTACTS_READ])
	@Field({ nullable: true })
	public accountHolder?: string

	@Field((type) => [String], { nullable: true })
	public moreMails?: Array<string>

	public isMember(): boolean {
		return this.contactGroups.find((group) => group.bexioId === 7) ? true : false
	}

	public getRank(): ContactGroup | null {
		const rankGroups = [17, 13, 11, 12, 28, 29, 15, 27, 26, 10, 14, 33, 22]

		if (this.contactGroups) {
			return this.contactGroups.find((group) => rankGroups.indexOf(group.bexioId) > -1) || null
		}

		return null
	}

	public getFunctions(): Array<ContactGroup> {
		const functionGroups = [9, 16, 32, 16]

		if (this.contactGroups) {
			return this.contactGroups.filter((group) => functionGroups.indexOf(group.bexioId) > -1)
		}

		return []
	}

	public async save(): Promise<Contact> {
		await super.save()
		await this.storeOverride()
		return this
	}

	@AfterLoad()
	private async loadOverride(): Promise<boolean> {
		let override = await getManager()
			.getRepository(ContactExtension)
			.findOne({ contactId: this.id })
		if (override) {
			for (let i in ContactExtensionInterface) {
				if (override.hasOwnProperty(i)) {
					//@ts-ignore
					this[i] = override[i]
				}
			}
		}

		this.rank = (this.getRank() || { name: '' }).name
		this.functions = this.getFunctions().map((func) => func.name)

		return true
	}

	@AfterLoad()
	private ajustDates(): void {
		this.birthday = new Date(this.birthday)
	}

	@AfterInsert()
	@AfterUpdate()
	public async storeOverride(): Promise<boolean> {
		let override = await getManager()
			.getRepository(ContactExtension)
			.findOne({ contactId: this.id })
		if (!override || Object.keys(override).length < 1) override = new ContactExtension()

		override.contact = this

		for (let i in ContactExtensionInterface) {
			if (this.hasOwnProperty(i)) {
				//@ts-ignore
				override[i] = this[i]
			}
		}

		override.save()
		return true
	}

	// used to remove some senitive data
	public restrictData(): void {
		delete this.entryDate
		delete this.exitDate
		delete this.bankName
		delete this.iban
		delete this.accountHolder
	}
}
