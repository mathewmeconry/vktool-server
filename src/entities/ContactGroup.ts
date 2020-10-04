import { Entity, Column, Index } from 'typeorm';
import BexioBase from './BexioBase';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
@Entity()
export default class ContactGroup extends BexioBase<ContactGroup> {
	@Index({ fulltext: true })
	@Field()
	@Column('text')
	public name: string;
}
