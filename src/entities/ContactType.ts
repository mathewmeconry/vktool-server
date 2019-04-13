import BexioBase from "./BexioBase";
import { Entity, Column } from "typeorm";
import { IsString } from "class-validator";

@Entity()
export default class ContactType extends BexioBase<ContactType> {
    @Column('text')
    @IsString()
    public name: string
}