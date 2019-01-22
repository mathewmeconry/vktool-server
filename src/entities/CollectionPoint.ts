import Base from "./Base";
import { Entity, Column } from "typeorm";

@Entity()
export default class CollectionPoint extends Base {
    @Column('text')
    public address: string

    @Column('text')
    public postcode: string

    @Column('text')
    public city: string

    constructor(address: string, postcode: string, city: string) {
        super()
        this.address = address
        this.postcode = postcode
        this.city = city
    }
}