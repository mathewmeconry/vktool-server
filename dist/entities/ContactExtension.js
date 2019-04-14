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
const class_validator_1 = require("class-validator");
const CollectionPoint_1 = __importDefault(require("./CollectionPoint"));
const Contact_1 = __importDefault(require("./Contact"));
const Base_1 = __importDefault(require("./Base"));
const User_1 = __importDefault(require("./User"));
const IsIBAN_1 = __importDefault(require("../validators/IsIBAN"));
// needs to be kept in sync with class...
var ContactExtensionInterface;
(function (ContactExtensionInterface) {
    ContactExtensionInterface[ContactExtensionInterface["collectionPoint"] = 0] = "collectionPoint";
    ContactExtensionInterface[ContactExtensionInterface["entryDate"] = 1] = "entryDate";
    ContactExtensionInterface[ContactExtensionInterface["exitDate"] = 2] = "exitDate";
    ContactExtensionInterface[ContactExtensionInterface["bankName"] = 3] = "bankName";
    ContactExtensionInterface[ContactExtensionInterface["iban"] = 4] = "iban";
    ContactExtensionInterface[ContactExtensionInterface["accountHolder"] = 5] = "accountHolder";
})(ContactExtensionInterface = exports.ContactExtensionInterface || (exports.ContactExtensionInterface = {}));
let ContactExtension = class ContactExtension extends Base_1.default {
    parseDates() {
        for (let i in this) {
            //@ts-ignore
            if (i.toLocaleLowerCase().indexOf('date') > -1)
                this[i] = new Date(this[i]);
        }
    }
};
__decorate([
    typeorm_1.OneToOne(type => Contact_1.default),
    typeorm_1.JoinColumn(),
    __metadata("design:type", Contact_1.default)
], ContactExtension.prototype, "contact", void 0);
__decorate([
    typeorm_1.Column('int', { nullable: true }),
    __metadata("design:type", Number)
], ContactExtension.prototype, "contactId", void 0);
__decorate([
    typeorm_1.ManyToOne(type => CollectionPoint_1.default, { nullable: true, eager: true }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", CollectionPoint_1.default)
], ContactExtension.prototype, "collectionPoint", void 0);
__decorate([
    typeorm_1.Column('date', { nullable: true }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDate(),
    __metadata("design:type", Date)
], ContactExtension.prototype, "entryDate", void 0);
__decorate([
    typeorm_1.Column('date', { nullable: true }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDate(),
    __metadata("design:type", Date)
], ContactExtension.prototype, "exitDate", void 0);
__decorate([
    typeorm_1.Column('text', { nullable: true }),
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], ContactExtension.prototype, "bankName", void 0);
__decorate([
    typeorm_1.Column('text', { nullable: true }),
    class_validator_1.IsOptional(),
    class_validator_1.Validate(IsIBAN_1.default),
    __metadata("design:type", String)
], ContactExtension.prototype, "iban", void 0);
__decorate([
    typeorm_1.Column('text', { nullable: true }),
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], ContactExtension.prototype, "accountHolder", void 0);
__decorate([
    typeorm_1.ManyToOne(type => User_1.default),
    typeorm_1.JoinColumn(),
    __metadata("design:type", User_1.default)
], ContactExtension.prototype, "updatedBy", void 0);
__decorate([
    typeorm_1.AfterLoad(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContactExtension.prototype, "parseDates", null);
ContactExtension = __decorate([
    typeorm_1.Entity()
], ContactExtension);
exports.default = ContactExtension;
//# sourceMappingURL=ContactExtension.js.map