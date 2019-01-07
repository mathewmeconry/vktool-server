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
const Contact_1 = __importDefault(require("../entities/Contact"));
const typeorm_1 = require("typeorm");
const ContactGroup_1 = __importDefault(require("../entities/ContactGroup"));
class ContactsController {
    static getContacts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.send(yield typeorm_1.getManager().getRepository(Contact_1.default).find());
        });
    }
    static getMembers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let contacts = yield typeorm_1.getManager().getRepository(Contact_1.default).find();
            res.send(contacts.filter(contact => ((contact.contactGroups || []).find(group => group.bexioId === 7))));
        });
    }
    static getRanks(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let filter = { 'bexioId': typeorm_1.In([17, 13, 11, 12, 28, 29, 15, 27, 26, 10, 14]) };
            let contactGroups = yield typeorm_1.getManager().getRepository(ContactGroup_1.default).find(filter);
            res.send(contactGroups);
        });
    }
}
exports.default = ContactsController;
//# sourceMappingURL=ContactsController.js.map