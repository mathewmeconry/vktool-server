import Base from './Base';
import {
	Entity,
	Column,
	OneToMany,
	JoinColumn,
	ManyToOne,
	getManager,
	Not,
	LessThan,
	AfterLoad,
	RelationId,
} from 'typeorm';
import Compensation from './Compensation';
import User from './User';
import { IsDate } from 'class-validator';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
@Entity()
export default class Payout extends Base<Payout> {
	@Field((type) => [Compensation])
	@OneToMany((type) => Compensation, (compensation) => compensation.payout)
	@JoinColumn()
	public compensations: Array<Compensation<any>>;

	@RelationId('compensations')
	public compensationIds: number[];

	@Field((type) => User)
	@ManyToOne((type) => User)
	@JoinColumn()
	public updatedBy: User;

	@RelationId('updatedBy')
	public updatedById: number;

	@Field()
	@Column('datetime')
	public until: Date;

	@Field()
	@Column('datetime')
	public from: Date;

	constructor(until: Date, from = new Date('1970-01-01')) {
		super();
		this.until = until;
		this.from = isNaN(from.getTime()) ? new Date('1970-01-01') : from;
	}
}
