import BexioBase from "./BexioBase";
import { Entity, Column } from "typeorm";
import { IsString } from "class-validator";
import { ObjectType, Field } from "type-graphql"

@ObjectType()
@Entity()
export default class ContactType extends BexioBase<ContactType> {
    @Field()
    @Column('text')
    public name: string
}