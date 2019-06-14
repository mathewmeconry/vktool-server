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
const Base_1 = __importDefault(require("./Base"));
const typeorm_1 = require("typeorm");
const Compensation_1 = __importDefault(require("./Compensation"));
const User_1 = __importDefault(require("./User"));
let Payout = class Payout extends Base_1.default {
    constructor(until, from = new Date('1970-01-01')) {
        super();
        this.total = 0;
        this.until = until;
        this.from = from;
    }
    calculateTotal() {
        if (this.compensations && this.compensations.length > 0) {
            for (let compensation of this.compensations) {
                this.total = this.total + parseFloat(compensation.amount.toString());
            }
        }
    }
};
__decorate([
    typeorm_1.OneToMany(type => Compensation_1.default, compensation => compensation.payout),
    typeorm_1.JoinColumn(),
    __metadata("design:type", Array)
], Payout.prototype, "compensations", void 0);
__decorate([
    typeorm_1.ManyToOne(type => User_1.default),
    typeorm_1.JoinColumn(),
    __metadata("design:type", User_1.default)
], Payout.prototype, "updatedBy", void 0);
__decorate([
    typeorm_1.Column('date'),
    __metadata("design:type", Date)
], Payout.prototype, "until", void 0);
__decorate([
    typeorm_1.Column('date'),
    __metadata("design:type", Date)
], Payout.prototype, "from", void 0);
__decorate([
    typeorm_1.AfterLoad(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Payout.prototype, "calculateTotal", null);
Payout = __decorate([
    typeorm_1.Entity(),
    __metadata("design:paramtypes", [Date, Object])
], Payout);
exports.default = Payout;
//# sourceMappingURL=Payout.js.map