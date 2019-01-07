import Compensation from "./Compensation";
import Contact from "./Contact";
import User from "./User";
import Payout from "./Payout";
import { Column, ChildEntity } from "typeorm";

@ChildEntity()
export default class CustomCompensation extends Compensation {
    @Column('text')
    public description: string

    constructor(member: Contact, creator: User, amount: number, date: Date, description: string, approved: boolean = false, paied: boolean = false, valutaDate?: Date, payout?: Payout) {
        super(member, creator, amount, date, approved, paied, valutaDate, payout)

        this.description = description
    }

    public calcAmount() { }
}