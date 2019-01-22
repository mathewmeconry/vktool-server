import { Entity, Column, OneToMany, JoinColumn, ManyToOne, ManyToMany, OneToOne, JoinTable } from "typeorm";
import BexioBase from "./BexioBase";
import Compensation from "./Compensation";
import User from "./User";
import ContactType from "./ContactType";
import ContactGroup from "./ContactGroup";
import CollectionPoint from "./CollectionPoint";

@Entity()
export default class Contact extends BexioBase {
    @Column('text')
    public nr: string

    @ManyToOne(type => ContactType, { eager: true })
    @JoinColumn()
    public contactType: ContactType

    @Column('text')
    public firstname: string

    @Column('text')
    public lastname: string

    @Column('date')
    public birthday: Date

    @Column('text')
    public address: string

    @Column('text')
    public postcode: string

    @Column('text')
    public city: string

    @Column('text')
    public mail: string

    @Column('text', { nullable: true })
    public mailSecond?: string

    @Column('text', { nullable: true })
    public phoneFixed?: string

    @Column('text', { nullable: true })
    public phoneFixedSecond?: string

    @Column('text', { nullable: true })
    public phoneMobile?: string

    @Column('text', { nullable: true })
    public remarks?: string

    @ManyToMany(type => ContactGroup, { eager: true })
    @JoinTable()
    public contactGroups: Array<ContactGroup>

    @Column('int')
    public userId: number

    @Column('int')
    public ownerId: number

    @OneToMany(type => Compensation, compensation => compensation.member, { nullable: true })
    public compensations: Promise<Array<Compensation>>

    @OneToOne(type => User, user => user.bexioContact, { nullable: true })
    public user?: User

    @ManyToOne(type => CollectionPoint, { nullable: true })
    @JoinColumn()
    public collectionPoint: CollectionPoint
}