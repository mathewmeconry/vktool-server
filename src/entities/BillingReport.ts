import { Entity, Column, JoinColumn, OneToMany, ManyToOne, ManyToMany, JoinTable } from 'typeorm'
import User from './User';
import Order from './Order';
import Base from './Base';
import OrderCompensation from './OrderCompensation';
import Contact from './Contact';
import { IsOptional, IsNumber, IsDate, IsArray, IsString, IsBoolean } from 'class-validator';

@Entity()
export default class BillingReport extends Base<BillingReport> {
    @ManyToOne(type => User, { eager: true })
    @JoinColumn()
    public creator: User

    @ManyToOne(type => Order, { eager: true })
    @JoinColumn()
    public order: Order

    @Column({ nullable: true })   
    public orderId?: number;

    @Column("date")
    public date: Date

    @OneToMany(type => OrderCompensation, compensation => compensation.billingReport, { eager: true })
    @JoinColumn()
    public compensations: Array<OrderCompensation>

    @ManyToMany(type => Contact, { eager: true })
    @JoinTable()
    public els: Array<Contact>

    @ManyToMany(type => Contact, { eager: true })
    @JoinTable()
    public drivers: Array<Contact>

    @ManyToOne(type => User, { nullable: true, eager: true })
    @JoinColumn()
    public approvedBy?: User

    @Column("boolean")
    public food: boolean

    @Column("text", { nullable: true })
    public remarks?: string

    @Column("text")
    public state: 'pending' | 'approved' | 'declined'

    @ManyToOne(type => User)
    @JoinColumn()
    public updatedBy: User

    constructor(creator: User, order: Order, orderDate: Date, compensations: Array<OrderCompensation>, els: Array<Contact>, drivers: Array<Contact>, food: boolean, remarks: string, state: 'pending' | 'approved' | 'declined', approvedBy?: User) {
        super()
        this.creator = creator
        this.order = order
        this.date = orderDate
        this.compensations = compensations
        this.approvedBy = approvedBy
        this.els = els
        this.drivers = drivers
        this.food = food
        this.remarks = remarks
        this.state = state
    }
}