import {
	Entity,
	Column,
	JoinColumn,
	OneToMany,
	ManyToOne,
	ManyToMany,
	JoinTable,
	RelationId,
	Index,
} from 'typeorm';
import User from './User';
import Order from './Order';
import Base from './Base';
import OrderCompensation from './OrderCompensation';
import Contact from './Contact';
import { IsOptional, IsNumber, IsDate, IsArray, IsString, IsBoolean } from 'class-validator';
import { ObjectType, Field } from 'type-graphql';

export enum BillingReportState {
	PENDING = 'pending',
	APPROVED = 'approved',
	DECLINED = 'declined',
}

@ObjectType()
@Entity()
export default class BillingReport extends Base<BillingReport> {
	@Field((type) => User)
	@ManyToOne((type) => User)
	@JoinColumn()
	public creator: User;

	@RelationId('creator')
	public creatorId: number;

	@Field((type) => Order)
	@ManyToOne((type) => Order)
	@JoinColumn()
	public order: Order;

	@RelationId('order')
	public orderId: number;

	@Field()
	@Column('datetime')
	public date: Date;

	@Field((type) => OrderCompensation)
	@OneToMany((type) => OrderCompensation, (compensation) => compensation.billingReport)
	@JoinColumn()
	public compensations: Array<OrderCompensation>;

	@RelationId('compensations')
	public compensationIds: Array<number>;

	@Field((type) => [Contact])
	@ManyToMany((type) => Contact)
	@JoinTable()
	public els: Array<Contact>;

	@RelationId('els')
	public elIds: Array<number>;

	@Field((type) => [Contact])
	@ManyToMany((type) => Contact)
	@JoinTable()
	public drivers: Array<Contact>;

	@RelationId('drivers')
	public driverIds: Array<number>;

	@Field((type) => User, { nullable: true })
	@ManyToOne((type) => User, { nullable: true })
	@JoinColumn()
	public approvedBy?: User;

	@RelationId('approvedBy')
	public approvedById?: number;

	@Field()
	@Column('boolean')
	public food: boolean;

	@Field({ nullable: true })
	@Column('text', { nullable: true })
	public remarks?: string;

	@Index({ fulltext: true })
	@Field()
	@Column('text')
	public state: BillingReportState;

	@Field((type) => User)
	@ManyToOne((type) => User)
	@JoinColumn()
	public updatedBy: User;

	@RelationId('updatedBy')
	public updatedById: number;

	constructor(
		creator: User,
		order: Order,
		orderDate: Date,
		compensations: Array<OrderCompensation>,
		els: Array<Contact>,
		drivers: Array<Contact>,
		food: boolean,
		remarks: string,
		state: BillingReportState,
		approvedBy?: User
	) {
		super();
		this.creator = creator;
		this.order = order;
		this.date = orderDate;
		this.compensations = compensations;
		this.approvedBy = approvedBy;
		this.els = els;
		this.drivers = drivers;
		this.food = food;
		this.remarks = remarks;
		this.state = state;
	}
}
