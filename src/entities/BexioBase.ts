import Base from './Base';
import { Column, Index } from 'typeorm';
import { IsNumber } from 'class-validator';
import { ObjectType, Field } from 'type-graphql';

@ObjectType({ isAbstract: true })
export default abstract class BexioBase<T> extends Base<T> {
	@Field()
	@Index('idx_bexioId')
	@Column('int')
	public bexioId: number;
}
