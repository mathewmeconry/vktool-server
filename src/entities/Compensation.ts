import {
	Column,
	ManyToOne,
	Entity,
	TableInheritance,
	JoinColumn,
	getManager,
	AfterLoad,
	RelationId,
	DeleteDateColumn,
} from 'typeorm';
import Contact from './Contact';
import Payout from './Payout';
import User from './User';
import Base from './Base';
import OrderCompensation from './OrderCompensation';
import { IsOptional, IsNumber, IsDate, IsBoolean } from 'class-validator';
import CustomCompensation from './CustomCompensation';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export default class Compensation<T> extends Base<T> {
	@Field((type) => Contact)
	@ManyToOne((type) => Contact, (contact) => contact.compensations)
	public member: Contact;

	@RelationId('member')
	public memberId: number;

	@Field((type) => User)
	@ManyToOne((type) => User)
	public creator: User;

	@RelationId('creator')
	public creatorId: number;

	@Field()
	@Column('decimal', { precision: 10, scale: 2 })
	public amount: number;

	@Field()
	@Column('datetime')
	public date: Date;

	@Field()
	@Column('boolean')
	public approved: boolean;

	@Field((type) => User)
	@ManyToOne((type) => User, { nullable: true })
	@JoinColumn()
	public approvedBy?: User;

	@RelationId('approvedBy')
	public approvedById?: number;

	@Field()
	@Column('boolean', { default: false })
	public paied: boolean;

	@Field((type) => Payout, { nullable: true })
	@ManyToOne((type) => Payout, (payout) => payout.compensations, { nullable: true })
	public payout?: Payout;

	@RelationId('payout')
	public payoutId?: number;

	@Field({ nullable: true })
	@Column({ nullable: true })
	public bexioBill?: number;

	@Field((type) => Compensation)
	@ManyToOne((type) => Compensation, { nullable: true })
	@JoinColumn()
	public transferCompensation?: Compensation<CustomCompensation>;

	@RelationId('transferCompensation')
	public transferCompensationId?: number;

	@Field((type) => User)
	@ManyToOne((type) => User)
	@JoinColumn()
	public updatedBy: User;

	@RelationId('updatedBy')
	public updatedById?: number;

	@Column('datetime', { nullable: true })
	@DeleteDateColumn()
	public deletedAt?: Date;

	@Field((type) => User, { nullable: true })
	@ManyToOne((type) => User)
	@JoinColumn()
	public deletedBy?: User;

	@RelationId('deletedBy')
	public deletedById?: number;

	constructor(
		member: Contact,
		creator: User,
		amount: number,
		date: Date,
		approved: boolean = false,
		paied: boolean = false,
		payout?: Payout
	) {
		super();
		this.member = member;
		this.creator = creator;
		this.amount = parseFloat((amount || 0).toString());
		this.date = date;
		this.approved = approved;
		this.paied = paied;
		this.payout = payout;
	}

	public async loadMember(): Promise<void> {
		this.member = (await getManager().getRepository(Contact).findOne(this.memberId)) as Contact;
	}

	public static isOrderBased(compensation: Compensation<any>): compensation is OrderCompensation {
		return (
			(<OrderCompensation>compensation).billingReport !== undefined &&
			(<OrderCompensation>compensation).billingReport !== null
		);
	}

	public static isCustom(compensation: Compensation<any>): compensation is CustomCompensation {
		return (
			(<CustomCompensation>compensation).description !== undefined &&
			(<CustomCompensation>compensation).description !== null
		);
	}

	@AfterLoad()
	private parseValues() {
		this.amount = parseFloat(this.amount.toString());
		this.date = new Date(this.date);
	}
}
