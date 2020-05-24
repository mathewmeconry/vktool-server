import { ManyToOne, Entity, JoinColumn, Column, OneToOne, AfterLoad, RelationId } from "typeorm"
import { IsOptional, IsDate, IsString, Validate } from 'class-validator'
import CollectionPoint from "./CollectionPoint"
import Contact from "./Contact"
import Base from "./Base"
import User from "./User"
import IsIBAN from "../validators/IsIBAN"

// needs to be kept in sync with class...
export enum ContactExtensionInterface {
    collectionPoint,
    entryDate,
    exitDate,
    bankName,
    iban,
    accountHolder,
    moreMails
}

@Entity()
export default class ContactExtension extends Base<ContactExtension> {
    @OneToOne(type => Contact)
    @JoinColumn()
    public contact: Contact

    @RelationId('contact')
    public contactId: number

    @ManyToOne(type => CollectionPoint, { nullable: true })
    @JoinColumn()
    public collectionPoint?: CollectionPoint

    @RelationId('collectionPoint')
    public collectionPointId?: number

    @Column('datetime', { nullable: true })
    public entryDate?: Date

    @Column('datetime', { nullable: true })
    public exitDate?: Date

    @Column('text', { nullable: true })
    public bankName?: string

    @Column('text', { nullable: true })
    public iban?: string

    @Column('text', { nullable: true })
    public accountHolder?: string

    @Column('simple-array', { nullable: true })
    public moreMails?: Array<string>

    @ManyToOne(type => User)
    @JoinColumn()
    public updatedBy: User

    @RelationId('updatedBy')
    public updatedById: number

    @AfterLoad()
    public parseDates() {
        for (let i in this) {
            //@ts-ignore
            if (i.toLocaleLowerCase().indexOf('date') > -1) this[i] = (this[i]) ? new Date(this[i]) : this[i]
        }
    }
}