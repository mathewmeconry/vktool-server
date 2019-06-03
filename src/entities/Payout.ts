import Base from "./Base";
import { Entity, Column, OneToMany, JoinColumn, ManyToOne, getManager, Not, LessThan, AfterLoad } from "typeorm";
import Compensation from "./Compensation";
import User from "./User";
import { IsDate } from "class-validator";

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

    public async claimCompensations() {
        if (!this.id) throw new Error('Payout has first to be saved')

        let qb = getManager().getRepository(Compensation).createQueryBuilder('compensation')
        let query = qb.update()
            .set({
                payout: this
            })
            .where('payout is NULL')
            .andWhere('date <= :dateUntil', { dateUntil: this.until })
            .andWhere('date >= :dateFrom', { dateFrom: this.from })
            .andWhere('approved = 1')
            .andWhere('deletedAt is NULL')

        return query.execute()
    }

    @AfterLoad()
    private calculateTotal() {
        for (let compensation of this.compensations) {
            this.total = this.total + compensation.amount
        }
    }
}