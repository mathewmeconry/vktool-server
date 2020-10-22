import { Field, ObjectType } from 'type-graphql';
import {
	Column,
	DeleteDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	RelationId,
	UpdateDateColumn,
} from 'typeorm';
import Base from './Base';
import Contact from './Contact';
import MaterialChangelogToProduct from './MaterialChangelogToProduct';
import User from './User';
import Warehouse from './Warehouse';
import File, { IFile } from './File';

@ObjectType()
@Entity()
export default class MaterialChangelog extends Base<MaterialChangelog> {
	@Field()
	@Column('datetime')
	public date: Date;

	@Field((type) => User)
	@ManyToOne((type) => User)
	public creator: User;

	@RelationId('creator')
	public creatorId: number;

	@Field()
	@Column('datetime')
	public createdAt: Date;

	@OneToMany((type) => MaterialChangelogToProduct, (m) => m.changelog)
	@JoinColumn()
	public changes: MaterialChangelogToProduct[];

	@RelationId('changes')
	public changeIds: number[];

	@ManyToOne((type) => Contact, { nullable: true })
	@JoinColumn()
	public inContact?: Contact;

	@RelationId('inContact')
	public inContactId?: number;

	@ManyToOne((type) => Contact, { nullable: true })
	@JoinColumn()
	public outContact?: Contact;

	@RelationId('outContact')
	public outContactId?: number;

	@ManyToOne((type) => Warehouse, { nullable: true })
	@JoinColumn()
	public inWarehouse?: Warehouse;

	@RelationId('inWarehouse')
	public inWarehouseId?: number;

	@ManyToOne((type) => Warehouse, { nullable: true })
	@JoinColumn()
	public outWarehouse?: Warehouse;

	@RelationId('outWarehouse')
	public outWarehouseId?: number;

	@Column('json')
	@Field(() => [File])
	public files: IFile[];

	@Column('longtext', { nullable: true })
	@Field({ nullable: true })
	public signature?: string;

	@UpdateDateColumn()
	public updatedAt: Date;

	@Field((type) => User)
	@ManyToOne((type) => User, { nullable: true })
	@JoinColumn()
	public updatedBy?: User;

	@RelationId('updatedBy')
	public updatedById?: number;

	@DeleteDateColumn()
	public deletedAt?: Date;

	@ManyToOne((type) => User, { nullable: true })
	@JoinColumn()
	public deletedBy?: User;

	@RelationId('deletedBy')
	public deletedById?: number;

	@Column('longtext', { nullable: true })
	@Field({ nullable: true })
	public remarks?: string;
}
