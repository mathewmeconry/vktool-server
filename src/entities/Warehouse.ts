import { Field, Int, ObjectType } from 'type-graphql';
import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm';
import Base from './Base';
import User from './User';

@ObjectType()
@Entity()
export default class Warehouse extends Base<Warehouse> {
	@Column()
	@Field()
	public name: string;

	@Column({ nullable: true })
	@Field(type => Int, { nullable: true })
	public maxWeight?: number;

	@DeleteDateColumn()
	public deletedAt?: Date;

	@ManyToOne((type) => User)
	@JoinColumn()
	public deletedBy?: User;

	@RelationId('deletedBy')
	public deletedById?: number;
}
