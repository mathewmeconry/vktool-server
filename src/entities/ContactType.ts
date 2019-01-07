import BexioBase from "./BexioBase";
import { Entity, Column } from "typeorm";

@Entity()
export default class ContactType extends BexioBase {
    @Column('text')
    public name: string
}