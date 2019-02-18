import Base from "./Base";
import { Entity, Column, OneToMany, JoinColumn, ManyToOne } from "typeorm";
import Compensation from "./Compensation";
import User from "./User";

@Entity()
export default class Payout extends Base {
    @Column('date')
    public date: Date

    @OneToMany(type => Compensation, compensation => compensation.payout)
    @JoinColumn()
    public compensations: Array<Compensation>

    @ManyToOne(type => User)
    @JoinColumn()
    public updatedBy: User
}