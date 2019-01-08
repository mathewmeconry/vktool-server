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
const User_1 = __importDefault(require("./User"));
const Order_1 = __importDefault(require("./Order"));
const Base_1 = __importDefault(require("./Base"));
const OrderCompensation_1 = __importDefault(require("./OrderCompensation"));
let BillingReport = class BillingReport extends Base_1.default {
    constructor(creator, order, orderDate, compensations, food, remarks, state, approvedBy) {
        super();
        this.creator = creator;
        this.order = order;
        this.date = orderDate;
        this.compensations = compensations;
        this.approvedBy = approvedBy;
        this.food = food;
        this.remarks = remarks;
        this.state = state;
    }
};
__decorate([
    typeorm_1.ManyToOne(type => User_1.default, { eager: true }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", User_1.default)
], BillingReport.prototype, "creator", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Order_1.default, { eager: true }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", Order_1.default)
], BillingReport.prototype, "order", void 0);
__decorate([
    typeorm_1.Column("date"),
    __metadata("design:type", Date)
], BillingReport.prototype, "date", void 0);
__decorate([
    typeorm_1.OneToMany(type => OrderCompensation_1.default, compensation => compensation.billingReport, { eager: true }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", Array)
], BillingReport.prototype, "compensations", void 0);
__decorate([
    typeorm_1.ManyToOne(type => User_1.default, { nullable: true, eager: true }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", User_1.default)
], BillingReport.prototype, "approvedBy", void 0);
__decorate([
    typeorm_1.Column("boolean"),
    __metadata("design:type", Boolean)
], BillingReport.prototype, "food", void 0);
__decorate([
    typeorm_1.Column("text"),
    __metadata("design:type", String)
], BillingReport.prototype, "remarks", void 0);
__decorate([
    typeorm_1.Column("text"),
    __metadata("design:type", String)
], BillingReport.prototype, "state", void 0);
__decorate([
    typeorm_1.ManyToOne(type => User_1.default, { eager: true }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", User_1.default)
], BillingReport.prototype, "updatedBy", void 0);
BillingReport = __decorate([
    typeorm_1.Entity(),
    __metadata("design:paramtypes", [User_1.default, Order_1.default, Date, Array, Boolean, String, String, User_1.default])
], BillingReport);
exports.default = BillingReport;
//# sourceMappingURL=BillingReport.js.map