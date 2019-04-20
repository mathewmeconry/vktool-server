import Compensation from "./Compensation";
import { ManyToOne, Column, BeforeInsert, ChildEntity } from "typeorm";
import BillingReport from "./BillingReport";
import Payout from "./Payout";
import User from "./User";
import Contact from "./Contact";
import { IsNumber, IsDate, IsBoolean } from "class-validator";

@ChildEntity()
export default class OrderCompensation extends Compensation<OrderCompensation> {
    @ManyToOne(type => BillingReport, billingreport => billingreport.compensations)
    public billingReport: BillingReport

    @Column('int')
    public billingReportId: number

    @Column('float')
    public dayHours: number = 0

    @Column('float')
    public nightHours: number = 0

    @Column('datetime', { precision: 6 })
    public from: Date

    @Column('datetime', { precision: 6 })
    public until: Date

    @Column('boolean')
    public charge: boolean

    constructor(member: Contact, creator: User, date: Date, billingReport: BillingReport, from: Date, until: Date, dayHours: number = 0, nightHours: number = 0, charge: boolean = true, approved: boolean = false, paied: boolean = false, valutaDate?: Date, payout?: Payout) {
        super(member, creator, 0, date, approved, paied, valutaDate, payout)
        this.billingReport = billingReport
        this.dayHours = dayHours
        this.nightHours = nightHours
        this.from = from
        this.until = until
        this.charge = charge
    }

    @BeforeInsert()
    public calcAmount() {
        this.calculateHours()
        this.amount = (this.dayHours * 10) + (this.nightHours * 15)
    }

    public calculateHours() {
        let _0700 = new Date("1970-01-01T07:00:00.000+01:00")
        let _2100 = new Date("1970-01-01T21:00:00.000+01:00")
        let from = new Date(this.from.getTime())
        let until = new Date(this.until.getTime())
        let dayHours = 0
        let nightHours = 0

        if (until < from) {
            until.setDate(until.getDate() + 1)
        }

        /**
         * Payout schema:
         * 07:00 - 21:00 = 10 Bucks
         * 21:00 - 07:00 = 15 Bucks
         */
        while (true) {
            if (from < _0700 && until > _0700) {
                nightHours += (_0700.getTime() - from.getTime()) / 1000 / 60 / 60
                from = new Date(_0700.toString())
            }

            if (from < _0700 && until < _0700) {
                nightHours += (until.getTime() - from.getTime()) / 1000 / 60 / 60
                break
            }

            if (from >= _0700 && from < _2100 && until > _2100) {
                dayHours += (_2100.getTime() - from.getTime()) / 1000 / 60 / 60
                from = new Date(_2100.toString())
            }

            if (from >= _0700 && until <= _2100) {
                dayHours += (until.getTime() - from.getTime()) / 1000 / 60 / 60
                break
            }


            _0700.setDate(_0700.getDate() + 1)
            _2100.setDate(_2100.getDate() + 1)
        }

        this.dayHours = dayHours
        this.nightHours = nightHours
    }
}