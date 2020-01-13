import { Entity, JoinColumn, Column, ManyToOne } from "typeorm"
import Contact from "./Contact"
import Base from "./Base"
import User from "./User"

@Entity()
export default class Logoff extends Base<Logoff> {
    @ManyToOne(type => Contact)
    @JoinColumn()
    public contact: Contact

    @Column('datetime', { precision: 6 })
    public from: Date

    @Column('datetime', { precision: 6 })
    public until: Date

    @Column('bool')
    public approved: boolean

    @Column('text', { nullable: true })
    public remarks?: string

    @ManyToOne(type => User)
    @JoinColumn()
    public createdBy: User

    @Column('date', { nullable: true })
    public deletedAt?: Date

    @ManyToOne(type => User, { eager: true })
    @JoinColumn()
    public deletedBy: User

    constructor(contact: Contact, from: Date, until: Date, approved: boolean, remarks: string, createdBy: User) {
        super()
        this.contact = contact
        this.from = from
        this.until = until
        this.approved = approved
        this.remarks = remarks || undefined
        this.createdBy = createdBy
    }
}