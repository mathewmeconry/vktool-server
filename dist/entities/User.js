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
const Base_1 = __importDefault(require("./Base"));
const Contact_1 = __importDefault(require("./Contact"));
const AuthRoles_1 = require("../interfaces/AuthRoles");
let User = class User extends Base_1.default {
    enrichPermissions() {
        if (this.bexioContact && typeof this.bexioContact.getRank === 'function') {
            const rank = this.bexioContact.getRank() || { bexioId: -1 };
            this.roles = this.roles.concat(AuthRoles_1.AuthRolesByRank[rank.bexioId] || []);
        }
        if (this.bexioContact && typeof this.bexioContact.getFunctions === 'function') {
            for (let func of this.bexioContact.getFunctions()) {
                this.roles = this.roles.concat(AuthRoles_1.AuthRolesByFunction[func.bexioId]);
            }
        }
        this.roles = this.roles.filter((element, index, arr) => arr.indexOf(element) === index);
    }
};
__decorate([
    typeorm_1.Column('text', { nullable: true }),
    __metadata("design:type", String)
], User.prototype, "outlookId", void 0);
__decorate([
    typeorm_1.Column('text', { nullable: true }),
    __metadata("design:type", String)
], User.prototype, "accessToken", void 0);
__decorate([
    typeorm_1.Column('text', { nullable: true }),
    __metadata("design:type", String)
], User.prototype, "refreshToken", void 0);
__decorate([
    typeorm_1.Column('text'),
    __metadata("design:type", String)
], User.prototype, "displayName", void 0);
__decorate([
    typeorm_1.Column('simple-array'),
    __metadata("design:type", Array)
], User.prototype, "roles", void 0);
__decorate([
    typeorm_1.Column({ precision: 6, type: 'timestamp' }),
    __metadata("design:type", Date)
], User.prototype, "lastLogin", void 0);
__decorate([
    typeorm_1.OneToOne(type => Contact_1.default, contact => contact.user, { nullable: true, eager: true }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", Contact_1.default)
], User.prototype, "bexioContact", void 0);
__decorate([
    typeorm_1.AfterLoad(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], User.prototype, "enrichPermissions", null);
User = __decorate([
    typeorm_1.Entity()
], User);
exports.default = User;
//# sourceMappingURL=User.js.map