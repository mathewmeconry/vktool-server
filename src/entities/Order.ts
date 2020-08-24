import {
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	Column,
	RelationId,
	Index,
	BeforeInsert,
	BeforeUpdate,
	AfterLoad,
} from 'typeorm';
import moment from 'moment';
import BexioBase from './BexioBase';
import Contact from './Contact';
import Position from './Position';
import BillingReport from './BillingReport';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
@Entity()
export default class Order extends BexioBase<Order> {
	@Index({ fulltext: true })
	@Field()
	@Column('text')
	public documentNr: string;

	@Index({ fulltext: true })
	@Field()
	@Column('text')
	public title: string;

	@Field()
	@Column('decimal', { precision: 10, scale: 2 })
	public total: number;

	@Field({ nullable: true })
	@Column('datetime', { nullable: true })
	public validFrom?: Date;

	@Index({ fulltext: true })
	@Field()
	@Column('text')
	public deliveryAddress: string;

	@Field((type) => Contact, { nullable: true })
	@ManyToOne((type) => Contact, { nullable: true })
	@JoinColumn()
	public contact?: Contact;

	@RelationId('contact')
	public contactId?: number;

	@Field((type) => [Position])
	@OneToMany((type) => Position, (position) => position.order)
	@JoinColumn()
	public positions: Array<Position>;

	@RelationId('positions')
	public positionIds: number[];

	@Field((type) => [BillingReport], { nullable: true })
	@OneToMany((type) => BillingReport, (billingreport) => billingreport.order, { nullable: true })
	public billingReports?: Array<BillingReport>;

	@RelationId('billingReports')
	public billingReportIds?: number[];

	@Field((type) => [Date])
	public execDates: Array<Date> = [];

	@Column('datetime', { precision: 6 })
	public firstExecDate: Date = new Date('1970-01-01');

	@Column('datetime', { precision: 6 })
	public lastExecDate: Date = new Date('1970-01-01');

	@BeforeInsert()
	@BeforeUpdate()
	public updateCornerDates() {
		this.findExecDates();
		const sorted = this.execDates.sort((a, b) => a.getTime() - b.getTime());
		this.firstExecDate = sorted[0] || new Date('1970-01-01');
		this.lastExecDate = sorted[sorted.length - 1] || new Date('1970-01-01');
	}

	@AfterLoad()
	public findExecDates(): void {
		let dateRegex = /((\d{2})\.(\d{2})\.(\d{4}))/gm;
		let dateTextRegex = /(\d{2}(\.|)( |)(januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember)( |)\d{4})/gim;
		moment.locale('de');

		this.execDates = [];
		if (this.positions) {
			for (let position of this.positions) {
				if (position.text) {
					// little hack for märz which is the only month with a umlaut and fixe some other typos of my collegues
					position.text = position.text.replace(/&auml;/g, 'ä').replace(/&nbsp;/g, ' ');
					let matches = position.text.match(dateRegex) || [];
					for (let match of matches) {
						this.execDates = this.execDates.concat(moment(match, 'DD.MM.YYYY').toDate());
					}

					matches = position.text.match(dateTextRegex) || [];
					for (let match of matches) {
						this.execDates = this.execDates.concat(moment(match, 'DD MMMM YYYY').toDate());
					}
				}
			}
		}

		let titleMatch = moment((this.title.match(dateRegex) || [])[0], 'DD.MM.YYYY').toDate();
		if (titleMatch instanceof Date && !isNaN(titleMatch.getTime()))
			this.execDates = this.execDates.concat(titleMatch);

		titleMatch = moment(
			(this.title
				.replace(/&auml;/g, 'ä')
				.replace(/&nbsp;/g, ' ')
				.match(dateTextRegex) || [])[0],
			'DD MMMM YYYY'
		).toDate();
		if (titleMatch instanceof Date && !isNaN(titleMatch.getTime())) {
			this.execDates = this.execDates.concat(titleMatch);
		}
	}
}
