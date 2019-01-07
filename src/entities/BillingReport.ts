import { Entity, Column, JoinColumn, OneToMany, ManyToOne } from 'typeorm'
import User from './User';
import Order from './Order';
import Base from './Base';
import OrderCompensation from './OrderCompensation';

@Entity()
export default class BillingReport extends Base {
    @ManyToOne(type => User, { eager: true })
    @JoinColumn()
    public creator: User

    @ManyToOne(type => Order, { eager: true })
    @JoinColumn()
    public order: Order

    @Column("date")
    public date: Date

    @OneToMany(type => OrderCompensation, compensation => compensation.billingReport, { eager: true })
    @JoinColumn()
    public compensations: Array<OrderCompensation>

    @ManyToOne(type => User, { nullable: true, eager: true })
    @JoinColumn()
    public approvedBy?: User

    @Column("boolean")
    public food: boolean

    @Column("text")
    public remarks: string

    @Column("text")
    public state: 'pending' | 'approved' | 'declined'

    @ManyToOne(type => User, { eager: true })
    @JoinColumn()
    public updatedBy: User

    constructor(creator: User, order: Order, orderDate: Date, compensations: Array<OrderCompensation>, food: boolean, remarks: string, state: 'pending' | 'approved' | 'declined', approvedBy?: User) {
        super()
        this.creator = creator
        this.order = order
        this.date = orderDate
        this.compensations = compensations
        this.approvedBy = approvedBy
        this.food = food
        this.remarks = remarks
        this.state = state
    }
}