import { Entity, Column, ManyToOne, RelationId } from "typeorm"
import BexioBase from "./BexioBase"
import Order from "./Order"
import { IsNumber, IsString, IsOptional } from "class-validator"
import { ObjectType, Field } from "type-graphql"

@ObjectType()
@Entity()
export default class Position extends BexioBase<Position> {
    @Field()
    @Column('int')
    public orderBexioId: number

    @Field(type => Order)
    @ManyToOne(type => Order, order => order.positions)
    public order: Order

    @RelationId('order')
    public orderId: number

    @Field()
    @Column('text')
    public positionType: string

    @Field({ nullable: true })
    @Column('text', { nullable: true })
    public text?: string

    @Field({ nullable: true })
    @Column('text', { nullable: true })
    public pos?: string

    @Field({ nullable: true })
    @Column('text', { nullable: true })
    public internalPos?: number

    @Field({ nullable: true })
    @Column('int', { nullable: true })
    public articleId?: number

    @Field({ nullable: true })
    @Column('decimal', { nullable: true, precision: 10, scale: 2 })
    public positionTotal?: number
}