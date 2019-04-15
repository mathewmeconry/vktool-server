import Base from "./Base";
import { Column } from "typeorm";
import { IsNumber } from "class-validator";

export default abstract class BexioBase<T> extends Base<T> {
    @Column('int')
    public bexioId: number
}