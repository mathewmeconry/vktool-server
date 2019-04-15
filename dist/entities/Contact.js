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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const BexioBase_1 = __importDefault(require("./BexioBase"));
const Compensation_1 = __importDefault(require("./Compensation"));
const User_1 = __importDefault(require("./User"));
const ContactType_1 = __importDefault(require("./ContactType"));
const ContactGroup_1 = __importDefault(require("./ContactGroup"));
const ContactExtension_1 = __importStar(require("./ContactExtension"));
let Contact = class Contact extends BexioBase_1.default {
    isMember() {
        return (this.contactGroups.find(group => group.bexioId === 7)) ? true : false;
    }
    getRank() {
        const rankGroups = [17, 13, 11, 12, 28, 29, 15, 27, 26, 10, 14];
        if (this.contactGroups) {
            return this.contactGroups.find(group => rankGroups.indexOf(group.bexioId) > -1) || null;
        }
        return null;
    }
    getFunctions() {
        const functionGroups = [22, 9, 16];
        if (this.contactGroups) {
            return this.contactGroups.filter(group => functionGroups.indexOf(group.bexioId) > -1);
        }
        return [];
    }
    save() {
        const _super = Object.create(null, {
            save: { get: () => super.save }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.save.call(this);
            yield this.storeOverride();
            return this;
        });
    }
    loadOverride() {
        return __awaiter(this, void 0, void 0, function* () {
            let override = yield typeorm_1.getManager().getRepository(ContactExtension_1.default).findOne({ contactId: this.id });
            if (override) {
                for (let i in ContactExtension_1.ContactExtensionInterface) {
                    if (override.hasOwnProperty(i)) {
                        //@ts-ignore
                        this[i] = override[i];
                    }
                }
            }
            this.rank = (this.getRank() || { name: '' }).name;
            this.functions = this.getFunctions().map(func => func.name);
            return true;
        });
    }
    ajustDates() {
        this.birthday = new Date(this.birthday);
    }
    storeOverride() {
        return __awaiter(this, void 0, void 0, function* () {
            let override = yield typeorm_1.getManager().getRepository(ContactExtension_1.default).findOne({ contactId: this.id });
            if (!override || Object.keys(override).length < 1)
                override = new ContactExtension_1.default();
            override.contact = this;
            for (let i in ContactExtension_1.ContactExtensionInterface) {
                if (this.hasOwnProperty(i)) {
                    //@ts-ignore
                    override[i] = this[i];
                }
            }
            override.save();
            return true;
        });
    }
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
], Contact.prototype, "ownerId", void 0);
__decorate([
    typeorm_1.OneToMany(type => Compensation_1.default, compensation => compensation.member, { nullable: true }),
    __metadata("design:type", Promise)
], Contact.prototype, "compensations", void 0);
__decorate([
    typeorm_1.OneToOne(type => User_1.default, user => user.bexioContact, { nullable: true }),
    __metadata("design:type", User_1.default
    // custom fields stored in contactExtension entity
    )
], Contact.prototype, "user", void 0);
__decorate([
    typeorm_1.AfterLoad(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Contact.prototype, "loadOverride", null);
__decorate([
    typeorm_1.AfterLoad(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Contact.prototype, "ajustDates", null);
__decorate([
    typeorm_1.AfterInsert(),
    typeorm_1.AfterUpdate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Contact.prototype, "storeOverride", null);
Contact = __decorate([
    typeorm_1.Entity()
], Contact);
exports.default = Contact;
//# sourceMappingURL=Contact.js.map