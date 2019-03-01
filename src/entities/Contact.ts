import { Entity, Column, OneToMany, JoinColumn, ManyToOne, ManyToMany, OneToOne, JoinTable, AfterLoad, getManager, BeforeUpdate, BeforeInsert } from "typeorm";
import BexioBase from "./BexioBase";
import Compensation from "./Compensation";
import User from "./User";
import ContactType from "./ContactType";
import ContactGroup from "./ContactGroup";
import CollectionPoint from "./CollectionPoint";
import ContactExtension, { ContactExtensionInterface } from "./ContactExtension";

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

    public collectionPoint?: CollectionPoint
    public entryDate?: Date
    public exitDate?: Date

    public isMember(): boolean {
        return (this.contactGroups.find(group => group.bexioId === 7)) ? true : false
    }

    public getRank(): ContactGroup | null {
        const rankGroups = [17, 13, 11, 12, 28, 29, 15, 27, 26, 10, 14]

        if (this.contactGroups) {
            return this.contactGroups.find(group => rankGroups.indexOf(group.bexioId) > -1) || null
        }

        return null
    }

    @AfterLoad()
    private async loadOverride(): Promise<boolean> {
        let override = await getManager().getRepository(ContactExtension).findOne({ contactId: this.id })
        if (override) {
            for (let i in ContactExtensionInterface) {
                if (override.hasOwnProperty(i)) {
                    //@ts-ignore
                    this[i] = override[i]
                }
            }
        }

        return true
    }


    @BeforeInsert()
    @BeforeUpdate()
    public async storeOverride(): Promise<boolean> {
        let override = await getManager().getRepository(ContactExtension).findOne({ contactId: this.id })
        if (!override || Object.keys(override).length < 1) override = new ContactExtension()

        override.contact = this

        for (let i in ContactExtensionInterface) {
            if (this.hasOwnProperty(i)) {
                //@ts-ignore
                override[i] = this[i]
                //@ts-ignore
                delete this[i]
            }
        }

        await getManager().getRepository(ContactExtension).save(override)
        return true
    }
}