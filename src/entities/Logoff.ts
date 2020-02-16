import { Entity, JoinColumn, Column, ManyToOne } from "typeorm"
import Contact from "./Contact"
import Base from "./Base"
import User from "./User"

export enum LogoffState {
    APPROVED = 'approved',
    PENDING = 'pending',
    DECLINED = 'declined'
}
@Entity()
export default class Logoff extends Base<Logoff> {
    @ManyToOne(type => Contact)
    @JoinColumn()
    public contact: Contact

    @Column('datetime', { precision: 6 })
    public from: Date

    @Column('datetime', { precision: 6 })
    public until: Date

    @Column("text")
    public state: LogoffState

    @Column('text', { nullable: true })
    public remarks?: string

    @ManyToOne(type => User)
    @JoinColumn()
    public createdBy: User

    @ManyToOne(type => User, { nullable: true })
    @JoinColumn()
    public changedStateBy: User

    @Column('date', { nullable: true })
    public deletedAt?: Date

    @ManyToOne(type => User, { eager: true })
    @JoinColumn()
    public deletedBy: User

    constructor(contact: Contact, from: Date, until: Date, state: LogoffState, remarks: string, createdBy: User) {
        super()
        this.contact = contact
        this.from = from
        this.until = until
        this.state = state
        this.remarks = remarks || undefined
        this.createdBy = createdBy
    }
}