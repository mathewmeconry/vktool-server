import Compensation from "./Compensation";
import Contact from "./Contact";
import User from "./User";
import Payout from "./Payout";
import { Column, ChildEntity } from "typeorm";
import { IsString } from "class-validator";

@ChildEntity()
export default class CustomCompensation extends Compensation<CustomCompensation> {
    @Column('text')
    public description: string

    constructor(member: Contact, creator: User, amount: number, date: Date, description: string, approved: boolean = false, paied: boolean = false, payout?: Payout) {
        super(member, creator, amount, date, approved, paied, payout)

        this.description = description
    }
}