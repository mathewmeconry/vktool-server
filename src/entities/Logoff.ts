import { Entity, JoinColumn, Column, ManyToOne, RelationId, DeleteDateColumn, Index } from 'typeorm';
import Contact from './Contact';
import Base from './Base';
import User from './User';
import { ObjectType, Field } from 'type-graphql';

export enum LogoffState {
	APPROVED = 'approved',
	PENDING = 'pending',
	DECLINED = 'declined',
}

@ObjectType()
@Entity()
export default class Logoff extends Base<Logoff> {
	@Field((type) => Contact)
	@ManyToOne((type) => Contact)
	@JoinColumn()
	public contact: Contact;

	@RelationId('contact')
	public contactId: number;

	@Field()
	@Column('datetime', { precision: 6 })
	public from: Date;

	@Field()
	@Column('datetime', { precision: 6 })
	public until: Date;

	@Index({ fulltext: true })
	@Field((type) => LogoffState)
	@Column('text')
	public state: LogoffState;

	@Field({ nullable: true })
	@Column('text', { nullable: true })
	public remarks?: string;

	@Field((type) => User)
	@ManyToOne((type) => User)
	@JoinColumn()
	public createdBy: User;

	@RelationId('createdBy')
	public createdById: number;

	@Field((type) => User, { nullable: true })
	@ManyToOne((type) => User, { nullable: true })
	@JoinColumn()
	public changedStateBy: User;

	@RelationId('changedStateBy')
	public changedStateById?: number;

	@Field({ nullable: true })
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
		contact: Contact,
		from: Date,
		until: Date,
		state: LogoffState,
		remarks: string,
		createdBy: User
	) {
		super();
		this.contact = contact;
		this.from = from;
		this.until = until;
		this.state = state;
		this.remarks = remarks || undefined;
		this.createdBy = createdBy;
	}
}
