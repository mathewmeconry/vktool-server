import { Entity, Column } from "typeorm";
import BexioBase from "./BexioBase";
import { IsString } from "class-validator";

@Entity()
export default class ContactGroup extends BexioBase<ContactGroup> {
    @Column('text')
    @IsString()
    public name: string
}