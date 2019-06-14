"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Compensation_1 = __importDefault(require("./Compensation"));
const typeorm_1 = require("typeorm");
const BillingReport_1 = __importDefault(require("./BillingReport"));
const Payout_1 = __importDefault(require("./Payout"));
const User_1 = __importDefault(require("./User"));
const Contact_1 = __importDefault(require("./Contact"));
let OrderCompensation = class OrderCompensation extends Compensation_1.default {
    constructor(member, creator, date, billingReport, from, until, dayHours = 0, nightHours = 0, charge = true, approved = false, paied = false, valutaDate, payout) {
        super(member, creator, 0, date, approved, paied, valutaDate, payout);
        this.dayHours = 0;
        this.nightHours = 0;
        this.billingReport = billingReport;
        this.dayHours = dayHours;
        this.nightHours = nightHours;
        this.from = from;
        this.until = until;
        this.charge = charge;
    }
    get description() {
        if (this.billingReport && this.billingReport.order) {
            if (this.billingReport.order.contact && !this.billingReport.order.contact.hasOwnProperty('firstname')) {
                return `${this.billingReport.order.title} (${this.billingReport.order.contact.lastname})`;
            }
            return this.billingReport.order.title;
        }
        return '';
    }
    calcAmount() {
        this.calculateHours();
        this.amount = (this.dayHours * 10) + (this.nightHours * 15);
    }
    calculateHours() {
        let _0700 = new Date("1970-01-01T07:00:00.000+01:00");
        let _2100 = new Date("1970-01-01T21:00:00.000+01:00");
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
};
__decorate([
    typeorm_1.ManyToOne(type => BillingReport_1.default, billingreport => billingreport.compensations),
    __metadata("design:type", BillingReport_1.default)
], OrderCompensation.prototype, "billingReport", void 0);
__decorate([
    typeorm_1.Column('int'),
    __metadata("design:type", Number)
], OrderCompensation.prototype, "billingReportId", void 0);
__decorate([
    typeorm_1.Column('float'),
    __metadata("design:type", Number)
], OrderCompensation.prototype, "dayHours", void 0);
__decorate([
    typeorm_1.Column('float'),
    __metadata("design:type", Number)
], OrderCompensation.prototype, "nightHours", void 0);
__decorate([
    typeorm_1.Column('datetime', { precision: 6 }),
    __metadata("design:type", Date)
], OrderCompensation.prototype, "from", void 0);
__decorate([
    typeorm_1.Column('datetime', { precision: 6 }),
    __metadata("design:type", Date)
], OrderCompensation.prototype, "until", void 0);
__decorate([
    typeorm_1.Column('boolean'),
    __metadata("design:type", Boolean)
], OrderCompensation.prototype, "charge", void 0);
__decorate([
    typeorm_1.BeforeInsert(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OrderCompensation.prototype, "calcAmount", null);
OrderCompensation = __decorate([
    typeorm_1.ChildEntity(),
    __metadata("design:paramtypes", [Contact_1.default, User_1.default, Date, BillingReport_1.default, Date, Date, Number, Number, Boolean, Boolean, Boolean, Date, Payout_1.default])
], OrderCompensation);
exports.default = OrderCompensation;
//# sourceMappingURL=OrderCompensation.js.map