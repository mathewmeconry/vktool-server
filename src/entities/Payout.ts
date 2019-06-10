import Base from "./Base";
import { Entity, Column, OneToMany, JoinColumn, ManyToOne, getManager, Not, LessThan, AfterLoad } from "typeorm";
import Compensation from "./Compensation";
import User from "./User";
import { IsDate } from "class-validator";
import CompensationService from "../services/CompensationService";

@Entity()
export default class Payout extends Base<Payout> {
    @OneToMany(type => Compensation, compensation => compensation.payout)
    @JoinColumn()
    public compensations: Array<Compensation<any>>

    @ManyToOne(type => User)
    @JoinColumn()
    public updatedBy: User

    @Column('date')
    public until: Date

    @Column('date')
    public from: Date

    public total: number = 0

    constructor(until: Date, from = new Date('1970-01-01')) {
        super()
        this.until = until
        this.from = from
    }

    @AfterLoad()
    private calculateTotal() {
        if (this.compensations && this.compensations.length > 0) {
            for (let compensation of this.compensations) {
                this.total = this.total + parseFloat(compensation.amount.toString())
            }
        }
    }
}