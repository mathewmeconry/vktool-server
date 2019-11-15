import Base from "./Base";
import { Column, Index } from "typeorm";
import { IsNumber } from "class-validator";

export default abstract class BexioBase<T> extends Base<T> {
    @Index("idx_bexioId")
    @Column('int')
    public bexioId: number
}