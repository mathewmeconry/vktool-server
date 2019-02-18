import { Column, ManyToOne, Entity, TableInheritance, JoinColumn, getManager } from "typeorm";
import Contact from "./Contact";
import Payout from "./Payout";
import User from "./User";
import Base from "./Base";
import OrderCompensation from "./OrderCompensation";
import CustomCompensation from "./CustomCompensation";

@Entity()
@TableInheritance({ column: { type: "varchar", name: "type" } })
export default class Compensation extends Base {
    @ManyToOne(type => Contact, contact => contact.compensations, { eager: true })
    public member: Contact

    @Column({ nullable: true })
    public memberId?: number;

    @ManyToOne(type => User, { eager: true })
    public creator: User

    @Column('decimal', { precision: 10, scale: 2 })
    public amount: number

    @Column('date')
    public date: Date

    @Column('boolean')
    public approved: boolean

    @ManyToOne(type => User, { eager: true, nullable: true })
    @JoinColumn()
    public approvedBy?: User

    @Column('boolean')
    public paied: boolean

    @Column('date', { nullable: true })
    public valutaDate?: Date

    @ManyToOne(type => Payout, payout => payout.compensations, { nullable: true, eager: true })
    public payout?: Payout

    @ManyToOne(type => User)
    @JoinColumn()
    public updatedBy: User

    @Column('date', { nullable: true })
    public deletedAt?: Date

    @ManyToOne(type => User, { eager: true })
    @JoinColumn()
    public deletedBy: User

    constructor(member: Contact, creator: User, amount: number, date: Date, approved: boolean = false, paied: boolean = false, valutaDate?: Date, payout?: Payout) {
        super()
        this.member = member
        this.creator = creator
        this.amount = parseFloat((amount || 0).toString())
        this.date = date
        this.approved = approved
        this.paied = paied
        this.valutaDate = valutaDate
        this.payout = payout
    }

    public async loadMember(): Promise<void> {
        this.member = (await getManager().getRepository(Contact).findOne(this.memberId)) as Contact
    }

    public static isOrderBased(compensation: Compensation): compensation is OrderCompensation {
        return (
            (<OrderCompensation>compensation).billingReport !== undefined &&
            (<OrderCompensation>compensation).billingReport !== null
        )
    }

    public static isCustom(compensation: Compensation): compensation is CustomCompensation {
        return (
            (<CustomCompensation>compensation).description !== undefined &&
            (<CustomCompensation>compensation).description !== null
        )
    }
}