import { Entity, Column, ManyToOne } from "typeorm";
import BexioBase from "./BexioBase";
import Order from "./Order";

@Entity()
export default class Position extends BexioBase {
    @Column('int')
    public orderBexioId: number

    @ManyToOne(type => Order, order => order.positions)
    public order: Order

    @Column('text')
    public positionType: string

    @Column('text', { nullable: true })
    public text?: string

    @Column('text', { nullable: true })
    public pos?: string

    @Column('text', { nullable: true })
    public internalPos?: string

    @Column('int', { nullable: true })
    public articleId?: number

    @Column('decimal', { nullable: true, precision: 10, scale: 2 })
    public positionTotal?: number
}