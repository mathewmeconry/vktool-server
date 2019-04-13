import Base from "./Base";
import { Entity, Column } from "typeorm";
import { IsString } from "class-validator";

@Entity()
export default class CollectionPoint extends Base<CollectionPoint> {
    @Column('text')
    @IsString()
    public name: string

    @Column('text')
    @IsString()
    public address: string

    @Column('text')
    @IsString()
    public postcode: string

    @Column('text')
    @IsString()
    public city: string

    constructor(name: string, address: string, postcode: string, city: string) {
        super()
        this.name = name
        this.address = address
        this.postcode = postcode
        this.city = city
    }
}