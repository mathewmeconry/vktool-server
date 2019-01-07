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
const BexioBase_1 = __importDefault(require("./BexioBase"));
const Order_1 = __importDefault(require("./Order"));
let Position = class Position extends BexioBase_1.default {
};
__decorate([
    typeorm_1.Column('int'),
    __metadata("design:type", Number)
], Position.prototype, "orderBexioId", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Order_1.default, order => order.positions),
    __metadata("design:type", Order_1.default)
], Position.prototype, "order", void 0);
__decorate([
    typeorm_1.Column('text'),
    __metadata("design:type", String)
], Position.prototype, "positionType", void 0);
__decorate([
    typeorm_1.Column('text', { nullable: true }),
    __metadata("design:type", String)
], Position.prototype, "text", void 0);
__decorate([
    typeorm_1.Column('text', { nullable: true }),
    __metadata("design:type", String)
], Position.prototype, "pos", void 0);
__decorate([
    typeorm_1.Column('text', { nullable: true }),
    __metadata("design:type", String)
], Position.prototype, "internalPos", void 0);
__decorate([
    typeorm_1.Column('int', { nullable: true }),
    __metadata("design:type", Number)
], Position.prototype, "articleId", void 0);
__decorate([
    typeorm_1.Column('decimal', { nullable: true, precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Position.prototype, "positionTotal", void 0);
Position = __decorate([
    typeorm_1.Entity()
], Position);
exports.default = Position;
//# sourceMappingURL=Position.js.map