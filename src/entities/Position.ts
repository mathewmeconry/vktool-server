import { Entity, Column, ManyToOne } from "typeorm";
import BexioBase from "./BexioBase";
import Order from "./Order";
import { IsNumber, IsString, IsOptional } from "class-validator";

@Entity()
export default class Position extends BexioBase<Position> {
    @Column('int')
    @IsNumber()
    public orderBexioId: number

    @ManyToOne(type => Order, order => order.positions)
    public order: Order

    @Column('text')
    @IsString()
    public positionType: string

    @Column('text', { nullable: true })
    @IsOptional()
    @IsString()
    public text?: string

    @Column('text', { nullable: true })
    @IsOptional()
    @IsString()
    public pos?: string

    @Column('text', { nullable: true })
    @IsOptional()
    @IsString()
    public internalPos?: string

    @Column('int', { nullable: true })
    @IsOptional()
    @IsNumber()
    public articleId?: number

    @Column('decimal', { nullable: true, precision: 10, scale: 2 })
    @IsOptional()
    @IsNumber()
    public positionTotal?: number
}