import { Field, ObjectType } from 'type-graphql';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import BexioBase from './BexioBase';
import Contact from './Contact';

@ObjectType()
@Entity()
export default class Product extends BexioBase<Product> {
	@ManyToOne((type) => Contact, { nullable: true })
	public contact?: Contact;

	@RelationId('contact')
	public contactId?: number;

	@Field({ nullable: true })
	@Column('int', { nullable: true })
	public articleType?: number;

	@Field({ nullable: true })
	@Column('text', { nullable: true })
	public delivererCode?: string;

	@Field({ nullable: true })
	@Column('text', { nullable: true })
	public delivererName?: string;

	@Field({ nullable: true })
	@Column('text', { nullable: true })
	public delivererDescription?: string;

	@Field()
	@Column()
	public internCode: string;

	@Field()
	@Column()
	public internName: string;

	@Field({ nullable: true })
	@Column('text', { nullable: true })
	public internDescription?: string;

	@Field({ nullable: true })
	@Column('float', { nullable: true })
	public purchasePrice?: number;

	@Field({ nullable: true })
	@Column('float', { nullable: true })
	public salePrice?: number;

	@Field({ nullable: true })
	@Column('float', { nullable: true })
	public purchaseTotal?: number;

	@Field({ nullable: true })
	@Column('float', { nullable: true })
	public saleTotal?: number;

	@Field({ nullable: true })
	@Column('text', { nullable: true })
	public remarks?: string;

	@Field({ nullable: true })
	@Column('float', { nullable: true })
	public deliveryPrice?: number;

	@Field({ nullable: true })
	@Column('int', { nullable: true })
	public articleGroupId?: number;

	@Field({ nullable: true })
	@Column('float', { nullable: true })
	public weight?: number;
}
