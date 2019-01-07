import Base from "./Base";
import { Column } from "typeorm";

export default abstract class BexioBase extends Base {
    @Column('int')
    public bexioId: number
}