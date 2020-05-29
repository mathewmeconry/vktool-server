import Base from './Base';
import { Entity, Column, Index } from 'typeorm';
import { IsString } from 'class-validator';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
@Entity()
export default class CollectionPoint extends Base<CollectionPoint> {
	@Index({ fulltext: true })
	@Field()
	@Column('text')
	public name: string;

	@Index({ fulltext: true })
	@Field()
	@Column('text')
	public address: string;

	@Index({ fulltext: true })
	@Field()
	@Column('text')
	public postcode: string;

	@Index({ fulltext: true })
	@Field()
	@Column('text')
	public city: string;

	constructor(name: string, address: string, postcode: string, city: string) {
		super();
		this.name = name;
		this.address = address;
		this.postcode = postcode;
		this.city = city;
	}
}
