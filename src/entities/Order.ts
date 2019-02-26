import { Entity, JoinColumn, ManyToOne, OneToMany, Column, AfterLoad } from "typeorm";
import moment from 'moment'
import BexioBase from "./BexioBase";
import Contact from "./Contact";
import Position from "./Position";
import BillingReport from "./BillingReport";

@Entity()
export default class Order extends BexioBase {
    @Column('text')
    public documentNr: string

    @Column('text')
    public title: string

    @Column('decimal', { precision: 10, scale: 2 })
    public total: number

    @Column('date', { nullable: true })
    public validFrom?: Date

    @ManyToOne(type => Contact, { eager: true })
    @JoinColumn()
    public contact: Contact

    @ManyToOne(type => Contact, { eager: true })
    @JoinColumn()
    public user: Contact

    @OneToMany(type => Position, position => position.order, { eager: true })
    @JoinColumn()
    public positions: Array<Position>

    @OneToMany(type => BillingReport, billingreport => billingreport.order, { nullable: true })
    public billingReports?: Array<BillingReport>

    public execDates: Array<Date>

    @AfterLoad()
    public findExecDates(): void {
        let dateRegex = /((\d{2})\.(\d{2})\.(\d{4}))/mg

        this.execDates = []
        if (this.positions) {
            for (let position of this.positions) {
                if (position.text) {
                    let matches = position.text.match(dateRegex) || []
                    for (let match of matches) {
                        this.execDates = this.execDates.concat(moment(match, 'DD.MM.YYYY').toDate())
                    }
                }
            }
        }
    }
}