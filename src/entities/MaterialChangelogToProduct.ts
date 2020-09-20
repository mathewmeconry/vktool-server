import { Field, Int, ObjectType } from 'type-graphql';
import {
	Column,
	DeleteDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	RelationId,
} from 'typeorm';
import Base from './Base';
import CustomCompensation from './CustomCompensation';
import MaterialChangelog from './MaterialChangelog';
import Product from './Product';
import User from './User';

@ObjectType()
@Entity()
export default class MaterialChangelogToProduct extends Base<MaterialChangelogToProduct> {
	@ManyToOne((type) => Product)
	@JoinColumn()
	public product: Product;

	@RelationId('product')
	public productId: number;

	@ManyToOne((type) => MaterialChangelog)
	@JoinColumn()
	public changelog: MaterialChangelog;

	@RelationId('changelog')
	public changelogId: number;

	@Field()
	@Column()
	public amount: number;

	@Field()
	@Column()
	public charge: boolean;

	@Field((type) => Int, { nullable: true })
	@Column({ nullable: true })
	public number?: number;

	@ManyToOne((type) => CustomCompensation, (obj) => obj.materialChangelogToProducts, {
		nullable: true,
	})
	@JoinColumn()
	public compensation?: CustomCompensation;

	@RelationId('compensation')
	public compensationId?: number;

	@DeleteDateColumn()
	public deletedAt?: Date;

	@ManyToOne((type) => User, { nullable: true })
	@JoinColumn()
	public deletedBy?: User;

	@RelationId('deletedBy')
	public deletedById?: number;
}
