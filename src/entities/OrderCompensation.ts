import Compensation from './Compensation';
import { ManyToOne, Column, BeforeInsert, ChildEntity, BeforeUpdate, RelationId } from 'typeorm';
import BillingReport from './BillingReport';
import Payout from './Payout';
import User from './User';
import Contact from './Contact';
import { IsNumber, IsDate, IsBoolean } from 'class-validator';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
@ChildEntity()
export default class OrderCompensation extends Compensation<OrderCompensation> {
	@Field((type) => BillingReport)
	@ManyToOne((type) => BillingReport, (billingreport) => billingreport.compensations)
	public billingReport: BillingReport;

	@RelationId('billingReport')
	public billingReportId: number;

	@Field()
	@Column('float')
	public dayHours: number = 0;

	@Field()
	@Column('float')
	public nightHours: number = 0;

	@Field()
	@Column('datetime', { precision: 6 })
	public from: Date;

	@Field()
	@Column('datetime', { precision: 6 })
	public until: Date;

	@Field()
	@Column('boolean')
	public charge: boolean;

	constructor(
		member: Contact,
		creator: User,
		date: Date,
		billingReport: BillingReport,
		from: Date,
		until: Date,
		dayHours: number = 0,
		nightHours: number = 0,
		charge: boolean = true,
		approved: boolean = false,
		paied: boolean = false,
		payout?: Payout
	) {
		super(member, creator, 0, date, approved, paied, payout);
		this.billingReport = billingReport;
		this.dayHours = dayHours;
		this.nightHours = nightHours;
		this.from = from;
		this.until = until;
		this.charge = charge;
	}

	@Field((type) => String)
	get descriptionWithoutTime() {
		if (this.billingReport && this.billingReport.order) {
			if (
				this.billingReport.order.contact &&
				!this.billingReport.order.contact.hasOwnProperty('firstname')
			) {
				return `${this.billingReport.order.title} (${this.billingReport.order.contact.lastname})`;
			}

			return this.billingReport.order.title;
		}

		return '';
	}

	@Field((type) => String)
	get description() {
		if (this.from && this.until) {
			return `${this.descriptionWithoutTime} (${`00${this.from.getHours()}`.slice(
				-2
			)}:${`00${this.from.getMinutes()}`.slice(-2)} - ${`00${this.until.getHours()}`.slice(
				-2
			)}:${`00${this.until.getMinutes()}`.slice(-2)})`;
		} else {
			return this.descriptionWithoutTime;
		}
	}

	public save(): Promise<OrderCompensation> {
		this.calcAmount();
		return super.save();
	}

	@BeforeInsert()
	@BeforeUpdate()
	public calcAmount() {
		this.calculateHours();
		this.amount = this.dayHours * 10 + this.nightHours * 15;
	}

	public calculateHours() {
		let _0700 = new Date('1970-01-01T07:00:00.000+01:00');
		let _2100 = new Date('1970-01-01T21:00:00.000+01:00');
		let from = new Date(this.from.getTime());
		let until = new Date(this.until.getTime());
		let dayHours = 0;
		let nightHours = 0;

		if (until < from) {
			until.setDate(until.getDate() + 1);
		}

		/**
		 * Payout schema:
		 * 07:00 - 21:00 = 10 Bucks
		 * 21:00 - 07:00 = 15 Bucks
		 */
		while (true) {
			if (from < _0700 && until > _0700) {
				nightHours += (_0700.getTime() - from.getTime()) / 1000 / 60 / 60;
				from = new Date(_0700.toString());
			}

			if (from < _0700 && until < _0700) {
				nightHours += (until.getTime() - from.getTime()) / 1000 / 60 / 60;
				break;
			}

			if (from >= _0700 && from < _2100 && until > _2100) {
				dayHours += (_2100.getTime() - from.getTime()) / 1000 / 60 / 60;
				from = new Date(_2100.toString());
			}

			if (from >= _0700 && until <= _2100) {
				dayHours += (until.getTime() - from.getTime()) / 1000 / 60 / 60;
				break;
			}

			_0700.setDate(_0700.getDate() + 1);
			_2100.setDate(_2100.getDate() + 1);
		}

		this.dayHours = dayHours;
		this.nightHours = nightHours;
	}
}
