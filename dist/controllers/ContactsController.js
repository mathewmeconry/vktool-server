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
const CollectionPoint_1 = __importDefault(require("../entities/CollectionPoint"));
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
    static postContact(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let contact = yield typeorm_1.getManager().getRepository(Contact_1.default).findOne({ id: req.body.id });
            if (contact) {
                if (req.url.indexOf('members') > -1 && !contact.isMember()) {
                    res.status(403);
                    res.send({
                        message: 'Not Authorized'
                    });
                    return;
                }
                contact.collectionPoint = (yield typeorm_1.getManager().getRepository(CollectionPoint_1.default).findOne({ id: req.body.collectionPointId })) || contact.collectionPoint;
                contact.entryDate = new Date(req.body.entryDate || contact.entryDate);
                contact.exitDate = new Date(req.body.exitDate || contact.exitDate);
                contact.bankName = req.body.bankName || contact.bankName;
                contact.iban = req.body.iban || contact.iban;
                contact.accountHolder = req.body.accountHolder || contact.accountHolder;
                try {
                    yield contact.save();
                    res.send(contact);
                }
                catch (err) {
                    res.status(500);
                    res.send({
                        message: 'sorry man...',
                        errors: err
                    });
                }
            }
            else {
                res.status(500);
                res.send({
                    message: 'sorry man...'
                });
            }
        });
    }
}
exports.default = ContactsController;
//# sourceMappingURL=ContactsController.js.map