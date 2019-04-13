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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const Contact_1 = __importDefault(require("./Contact"));
const Payout_1 = __importDefault(require("./Payout"));
const User_1 = __importDefault(require("./User"));
const Base_1 = __importDefault(require("./Base"));
const class_validator_1 = require("class-validator");
let Compensation = class Compensation extends Base_1.default {
    constructor(member, creator, amount, date, approved = false, paied = false, valutaDate, payout) {
        super();
        this.member = member;
        this.creator = creator;
        this.amount = parseFloat((amount || 0).toString());
        this.date = date;
        this.approved = approved;
        this.paied = paied;
        this.valutaDate = valutaDate;
        this.payout = payout;
    }
    loadMember() {
        return __awaiter(this, void 0, void 0, function* () {
            this.member = (yield typeorm_1.getManager().getRepository(Contact_1.default).findOne(this.memberId));
        });
    }
    static isOrderBased(compensation) {
        return (compensation.billingReport !== undefined &&
            compensation.billingReport !== null);
    }
    static isCustom(compensation) {
        return (compensation.description !== undefined &&
            compensation.description !== null);
    }
};
__decorate([
    typeorm_1.ManyToOne(type => Contact_1.default, contact => contact.compensations, { eager: true }),
    __metadata("design:type", Contact_1.default)
], Compensation.prototype, "member", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    class_validator_1.IsOptional(),
    class_validator_1.IsNumber(),
    __metadata("design:type", Number)
], Compensation.prototype, "memberId", void 0);
__decorate([
    typeorm_1.ManyToOne(type => User_1.default, { eager: true }),
    __metadata("design:type", User_1.default)
], Compensation.prototype, "creator", void 0);
__decorate([
    typeorm_1.Column('decimal', { precision: 10, scale: 2 }),
    class_validator_1.IsNumber(),
    __metadata("design:type", Number)
], Compensation.prototype, "amount", void 0);
__decorate([
    typeorm_1.Column('date'),
    class_validator_1.IsDate(),
    __metadata("design:type", Date)
], Compensation.prototype, "date", void 0);
__decorate([
    typeorm_1.Column('boolean'),
    class_validator_1.IsBoolean(),
    __metadata("design:type", Boolean)
], Compensation.prototype, "approved", void 0);
__decorate([
    typeorm_1.ManyToOne(type => User_1.default, { eager: true, nullable: true }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", User_1.default)
], Compensation.prototype, "approvedBy", void 0);
__decorate([
    typeorm_1.Column('boolean'),
    class_validator_1.IsBoolean(),
    __metadata("design:type", Boolean)
], Compensation.prototype, "paied", void 0);
__decorate([
    typeorm_1.Column('date', { nullable: true }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDate(),
    __metadata("design:type", Date)
], Compensation.prototype, "valutaDate", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Payout_1.default, payout => payout.compensations, { nullable: true, eager: true }),
    __metadata("design:type", Payout_1.default)
], Compensation.prototype, "payout", void 0);
__decorate([
    typeorm_1.ManyToOne(type => User_1.default),
    typeorm_1.JoinColumn(),
    __metadata("design:type", User_1.default)
], Compensation.prototype, "updatedBy", void 0);
__decorate([
    typeorm_1.Column('date', { nullable: true }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDate(),
    __metadata("design:type", Date)
], Compensation.prototype, "deletedAt", void 0);
__decorate([
    typeorm_1.ManyToOne(type => User_1.default, { eager: true }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", User_1.default)
], Compensation.prototype, "deletedBy", void 0);
Compensation = __decorate([
    typeorm_1.Entity(),
    typeorm_1.TableInheritance({ column: { type: "varchar", name: "type" } }),
    __metadata("design:paramtypes", [Contact_1.default, User_1.default, Number, Date, Boolean, Boolean, Date, Payout_1.default])
], Compensation);
exports.default = Compensation;
//# sourceMappingURL=Compensation.js.map