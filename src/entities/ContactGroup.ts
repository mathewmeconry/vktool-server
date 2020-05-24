import { Entity, Column } from 'typeorm';
import BexioBase from './BexioBase';
import { IsString } from 'class-validator';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
@Entity()
export default class ContactGroup extends BexioBase<ContactGroup> {
	@Field()
	@Column('text')
	public name: string;
}
