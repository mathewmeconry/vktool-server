import { Entity, JoinColumn, ManyToOne, OneToMany, Column, AfterLoad } from "typeorm";
import moment from 'moment'
import BexioBase from "./BexioBase";
import Contact from "./Contact";
import Position from "./Position";
import BillingReport from "./BillingReport";
import { IsString, IsNumber, IsOptional, IsDate } from "class-validator";

@Entity()
export default class Order extends BexioBase<Order> {
    @Column('text')
    public documentNr: string

    @Column('text')
    public title: string

    @Column('decimal', { precision: 10, scale: 2 })
    public total: number

    @Column('date', { nullable: true })
    public validFrom?: Date

    @Column('text')
    public deliveryAddress: string

    @ManyToOne(type => Contact, { eager: true })
    @JoinColumn()
    public contact: Contact

    @OneToMany(type => Position, position => position.order, { eager: true })
    @JoinColumn()
    public positions: Array<Position>

    @OneToMany(type => BillingReport, billingreport => billingreport.order, { nullable: true })
    public billingReports?: Array<BillingReport>

    public execDates: Array<Date>

    @AfterLoad()
    public findExecDates(): void {
        let dateRegex = /((\d{2}|\d{1})\.(\d{2}|\d{1})\.(\d{4}|\d{2}))/mg
        let dateTextRegex = /(\d{2}|\d{1}(\.|)( |)(januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember)( |)\d{4}|\d{2})/mgi
        moment.locale('de')

        this.execDates = []
        if (this.positions) {
            for (let position of this.positions) {
                if (position.text) {
                    // little hack for märz which is the only month with a umlaut and fixe some other typos of my collegues
                    position.text = position.text.replace(/&auml;/g, 'ä').replace(/&nbsp;/g, ' ')
                    let matches = position.text.match(dateRegex) || []
                    for (let match of matches) {
                        this.execDates = this.execDates.concat(moment(match, 'DD.MM.YYYY').toDate())
                    }

                    matches = position.text.match(dateTextRegex) || []
                    for (let match of matches) {
                        this.execDates = this.execDates.concat(moment(match, 'DD MMMM YYYY').toDate())
                    }
                }
            }
        }

        let titleMatch = moment((this.title.match(dateRegex) || [])[0], 'DD.MM.YYYY').toDate()
        if (titleMatch instanceof Date && !isNaN(titleMatch.getTime())) this.execDates = this.execDates.concat(titleMatch)

        titleMatch = moment((this.title.replace(/&auml;/g, 'ä').replace(/&nbsp;/g, ' ').match(dateTextRegex) || [])[0], 'DD MMMM YYYY').toDate()
        if (titleMatch instanceof Date && !isNaN(titleMatch.getTime())) this.execDates = this.execDates.concat(titleMatch)
    }
}