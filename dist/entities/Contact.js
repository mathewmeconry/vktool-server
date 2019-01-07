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
const Compensation_1 = __importDefault(require("./Compensation"));
const User_1 = __importDefault(require("./User"));
const ContactType_1 = __importDefault(require("./ContactType"));
const ContactGroup_1 = __importDefault(require("./ContactGroup"));
let Contact = class Contact extends BexioBase_1.default {
};
__decorate([
    typeorm_1.Column('text'),
    __metadata("design:type", String)
], Contact.prototype, "nr", void 0);
__decorate([
    typeorm_1.ManyToOne(type => ContactType_1.default, { eager: true }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", ContactType_1.default)
], Contact.prototype, "contactType", void 0);
__decorate([
    typeorm_1.Column('text'),
    __metadata("design:type", String)
], Contact.prototype, "firstname", void 0);
__decorate([
    typeorm_1.Column('text'),
    __metadata("design:type", String)
], Contact.prototype, "lastname", void 0);
__decorate([
    typeorm_1.Column('date'),
    __metadata("design:type", Date)
], Contact.prototype, "birthday", void 0);
__decorate([
    typeorm_1.Column('text'),
    __metadata("design:type", String)
], Contact.prototype, "address", void 0);
__decorate([
    typeorm_1.Column('text'),
    __metadata("design:type", String)
], Contact.prototype, "postcode", void 0);
__decorate([
    typeorm_1.Column('text'),
    __metadata("design:type", String)
], Contact.prototype, "city", void 0);
__decorate([
    typeorm_1.Column('text'),
    __metadata("design:type", String)
], Contact.prototype, "mail", void 0);
__decorate([
    typeorm_1.Column('text', { nullable: true }),
    __metadata("design:type", String)
], Contact.prototype, "mailSecond", void 0);
__decorate([
    typeorm_1.Column('text', { nullable: true }),
    __metadata("design:type", String)
], Contact.prototype, "phoneFixed", void 0);
__decorate([
    typeorm_1.Column('text', { nullable: true }),
    __metadata("design:type", String)
], Contact.prototype, "phoneFixedSecond", void 0);
__decorate([
    typeorm_1.Column('text', { nullable: true }),
    __metadata("design:type", String)
], Contact.prototype, "phoneMobile", void 0);
__decorate([
    typeorm_1.Column('text', { nullable: true }),
    __metadata("design:type", String)
], Contact.prototype, "remarks", void 0);
__decorate([
    typeorm_1.ManyToMany(type => ContactGroup_1.default, { eager: true }),
    typeorm_1.JoinTable(),
    __metadata("design:type", Array)
], Contact.prototype, "contactGroups", void 0);
__decorate([
    typeorm_1.Column('int'),
    __metadata("design:type", Number)
], Contact.prototype, "userId", void 0);
__decorate([
    typeorm_1.Column('int'),
    __metadata("design:type", Number)
], Contact.prototype, "ownerId", void 0);
__decorate([
    typeorm_1.OneToMany(type => Compensation_1.default, compensation => compensation.member, { nullable: true }),
    __metadata("design:type", Promise)
], Contact.prototype, "compensations", void 0);
__decorate([
    typeorm_1.OneToOne(type => User_1.default, user => user.bexioContact, { nullable: true }),
    __metadata("design:type", User_1.default)
], Contact.prototype, "user", void 0);
Contact = __decorate([
    typeorm_1.Entity()
], Contact);
exports.default = Contact;
//# sourceMappingURL=Contact.js.map