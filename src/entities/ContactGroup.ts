import { Entity, Column } from "typeorm";
import BexioBase from "./BexioBase";

@Entity()
export default class ContactGroup extends BexioBase {
    @Column('text')
    public name: string
}