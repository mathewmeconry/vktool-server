"use strict";
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
const Order_1 = __importDefault(require("../../entities/Order"));
const Position_1 = __importDefault(require("../../entities/Position"));
const Contact_1 = __importDefault(require("../../entities/Contact"));
const ContactType_1 = __importDefault(require("../../entities/ContactType"));
const ContactGroup_1 = __importDefault(require("../../entities/ContactGroup"));
const typeorm_1 = require("typeorm");
const User_1 = __importDefault(require("../../entities/User"));
const AuthRoles_1 = require("../../interfaces/AuthRoles");
function genOrders(contact) {
    return __awaiter(this, void 0, void 0, function* () {
        let today = new Date();
        let order = new Order_1.default();
        order.contact = contact;
        order.bexioId = 1;
        order.deliveryAddress = 'any fancy address';
        order.documentNr = 'Nr 001';
        order.title = 'Mock Order';
        order.total = 999;
        order.validFrom = today;
        order = yield order.save();
        let position = new Position_1.default();
        position.bexioId = 1;
        position.orderBexioId = 1;
        position.positionType = 'anyType';
        position.order = order;
        position.text = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`;
        yield position.save();
        return order;
    });
}
exports.genOrders = genOrders;
function genMockContact(contactType, contactGroups) {
    return __awaiter(this, void 0, void 0, function* () {
        let contact = new Contact_1.default();
        contact.address = 'this street 1';
        contact.bankName = 'any bank';
        contact.bexioId = 1;
        contact.birthday = new Date();
        contact.city = 'any city';
        contact.contactGroups = contactGroups;
        contact.contactType = contactType;
        contact.firstname = 'Mock';
        contact.lastname = 'User';
        contact.nr = '1';
        contact.postcode = '1111';
        contact.mail = 'mock@mail.com';
        contact.ownerId = 1;
        return contact.save();
    });
}
exports.genMockContact = genMockContact;
function genMockContactType() {
    return __awaiter(this, void 0, void 0, function* () {
        let type = new ContactType_1.default();
        type.name = 'Mock Type';
        type.bexioId = 1;
        return type.save();
    });
}
exports.genMockContactType = genMockContactType;
function genMockContactGroup(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let group;
        if (id) {
            group = (yield typeorm_1.getManager().getRepository(ContactGroup_1.default).findOne(id)) || new ContactGroup_1.default();
            group.name = 'MockGroup';
            group.bexioId = id;
            group.id = id;
            return group.save();
        }
        else {
            group = new ContactGroup_1.default();
            group.name = 'MockGroup';
            group.bexioId = 1;
            return group.save();
        }
    });
}
exports.genMockContactGroup = genMockContactGroup;
function genMockUser() {
    return __awaiter(this, void 0, void 0, function* () {
        let user = new User_1.default();
        user.displayName = 'Mock User';
        user.provider = 'office365';
        user.roles = [AuthRoles_1.AuthRoles.ADMIN];
        return user.save();
    });
}
exports.genMockUser = genMockUser;
//# sourceMappingURL=GenMockData.js.map