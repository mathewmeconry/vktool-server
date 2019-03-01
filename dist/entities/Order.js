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
const typeorm_1 = require("typeorm");
const moment_1 = __importDefault(require("moment"));
const BexioBase_1 = __importDefault(require("./BexioBase"));
const Contact_1 = __importDefault(require("./Contact"));
const Position_1 = __importDefault(require("./Position"));
const BillingReport_1 = __importDefault(require("./BillingReport"));
let Order = class Order extends BexioBase_1.default {
    findExecDates() {
        let dateRegex = /((\d{2})\.(\d{2})\.(\d{4}))/mg;
        let dateTextRegex = /(\d{2}\.( |)(januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember)( |)\d{4})/mgi;
        moment_1.default.locale('de');
        this.execDates = [];
        if (this.positions) {
            for (let position of this.positions) {
                if (position.text) {
                    let matches = position.text.match(dateRegex) || [];
                    for (let match of matches) {
                        this.execDates = this.execDates.concat(moment_1.default(match, 'DD.MM.YYYY').toDate());
                    }
                    matches = position.text.match(dateTextRegex) || [];
                    for (let match of matches) {
                        this.execDates = this.execDates.concat(moment_1.default(match, 'DD MMMM YYYY').toDate());
                    }
                }
            }
        }
        let titleMatch = moment_1.default((this.title.match(dateRegex) || [])[0], 'DD.MM.YYYY').toDate();
        if (titleMatch instanceof Date && !isNaN(titleMatch.getTime()))
            this.execDates = this.execDates.concat(titleMatch);
        titleMatch = moment_1.default((this.title.match(dateTextRegex) || [])[0], 'DD MMMM YYYY').toDate();
        if (titleMatch instanceof Date && !isNaN(titleMatch.getTime()))
            this.execDates = this.execDates.concat(titleMatch);
    }
};
__decorate([
    typeorm_1.Column('text'),
    __metadata("design:type", String)
], Order.prototype, "documentNr", void 0);
__decorate([
    typeorm_1.Column('text'),
    __metadata("design:type", String)
], Order.prototype, "title", void 0);
__decorate([
    typeorm_1.Column('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Order.prototype, "total", void 0);
__decorate([
    typeorm_1.Column('date', { nullable: true }),
    __metadata("design:type", Date)
], Order.prototype, "validFrom", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Contact_1.default, { eager: true }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", Contact_1.default)
], Order.prototype, "contact", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Contact_1.default, { eager: true }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", Contact_1.default)
], Order.prototype, "user", void 0);
__decorate([
    typeorm_1.OneToMany(type => Position_1.default, position => position.order, { eager: true }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", Array)
], Order.prototype, "positions", void 0);
__decorate([
    typeorm_1.OneToMany(type => BillingReport_1.default, billingreport => billingreport.order, { nullable: true }),
    __metadata("design:type", Array)
], Order.prototype, "billingReports", void 0);
__decorate([
    typeorm_1.AfterLoad(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Order.prototype, "findExecDates", null);
Order = __decorate([
    typeorm_1.Entity()
], Order);
exports.default = Order;
//# sourceMappingURL=Order.js.map