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
const Contact_1 = __importDefault(require("./Contact"));
const User_1 = __importDefault(require("./User"));
const Payout_1 = __importDefault(require("./Payout"));
const typeorm_1 = require("typeorm");
let CustomCompensation = class CustomCompensation extends Compensation_1.default {
    constructor(member, creator, amount, date, description, approved = false, paied = false, valutaDate, payout) {
        super(member, creator, amount, date, approved, paied, valutaDate, payout);
        this.description = description;
    }
    calcAmount() { }
};
__decorate([
    typeorm_1.Column('text'),
    __metadata("design:type", String)
], CustomCompensation.prototype, "description", void 0);
CustomCompensation = __decorate([
    typeorm_1.ChildEntity(),
    __metadata("design:paramtypes", [Contact_1.default, User_1.default, Number, Date, String, Boolean, Boolean, Date, Payout_1.default])
], CustomCompensation);
exports.default = CustomCompensation;
//# sourceMappingURL=CustomCompensation.js.map