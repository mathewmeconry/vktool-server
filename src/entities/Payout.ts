import Base from "./Base";
import { Entity, Column, OneToMany, JoinColumn, ManyToOne } from "typeorm";
import Compensation from "./Compensation";
import User from "./User";
import { IsDate } from "class-validator";

@Entity()
export default class Payout extends Base<Payout> {
    @Column('date')
    @IsDate()
    public date: Date

    @OneToMany(type => Compensation, compensation => compensation.payout)
    @JoinColumn()
    public compensations: Array<Compensation<any>>

    @ManyToOne(type => User)
    @JoinColumn()
    public updatedBy: User
}