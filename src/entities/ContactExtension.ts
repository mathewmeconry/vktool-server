import { ManyToOne, Entity, JoinColumn, Column, OneToOne } from "typeorm";
import CollectionPoint from "./CollectionPoint";
import Contact from "./Contact";
import Base from "./Base";
import User from "./User";

// needs to be kept in sync with class...
export enum ContactExtensionInterface {
    collectionPoint,
    entryDate,
    exitDate
}

@Entity()
export default class ContactExtension extends Base {
    @OneToOne(type => Contact)
    @JoinColumn()
    public contact: Contact

    @Column('int', { nullable: true })
    public contactId: number

    @ManyToOne(type => CollectionPoint, { nullable: true, eager: true })
    @JoinColumn()
    public collectionPoint?: CollectionPoint

    @Column('date', { nullable: true })
    public entryDate?: Date

    @Column('date', { nullable: true })
    public exitDate?: Date

    @ManyToOne(type => User)
    @JoinColumn()
    public updatedBy: User
}