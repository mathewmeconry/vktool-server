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
const chai_1 = require("chai");
const supertest = require("supertest");
const TestHelper_1 = __importDefault(require("../helpers/TestHelper"));
describe('ContactsController', function () {
    this.timeout(5000);
    let app;
    let editContact = {
        id: 1,
        collectionPointId: 1,
        entryDate: '1970-01-01T00:00:00.000Z',
        exitDate: '1970-01-01T00:00:00.000Z',
        bankName: 'my super bank',
        iban: 'GB33BUKB20201555555555',
        accountHolder: 'myself'
    };
    before(() => {
        app = TestHelper_1.default.app;
    });
    it('should get all contacts', () => __awaiter(this, void 0, void 0, function* () {
        return supertest(app)
            .get('/api/contacts')
            .set('Cookie', TestHelper_1.default.authenticatedCookies)
            .expect(200)
            .then(res => {
            chai_1.expect(res.body.length).to.be.greaterThan(0);
        });
    }));
    it('should get all members', () => __awaiter(this, void 0, void 0, function* () {
        return supertest(app)
            .get('/api/members')
            .set('Cookie', TestHelper_1.default.authenticatedCookies)
            .expect(200)
            .then(res => {
            chai_1.expect(res.body.length).to.be.greaterThan(0);
            for (let member of res.body) {
                chai_1.expect(member).to.have.ownProperty('firstname');
                chai_1.expect(member).to.have.ownProperty('lastname');
                chai_1.expect(member).to.have.ownProperty('address');
                chai_1.expect(member).to.have.ownProperty('postcode');
                chai_1.expect(member).to.have.ownProperty('city');
                chai_1.expect(member).to.have.ownProperty('mail');
                chai_1.expect(member).to.have.ownProperty('rank');
                chai_1.expect(member).to.have.ownProperty('functions');
                chai_1.expect(member).to.have.ownProperty('collectionPoint');
                chai_1.expect(member).to.have.ownProperty('entryDate');
                chai_1.expect(member).to.have.ownProperty('exitDate');
                chai_1.expect(member).to.have.ownProperty('bankName');
                chai_1.expect(member).to.have.ownProperty('iban');
                chai_1.expect(member).to.have.ownProperty('accountHolder');
                let groupIds = member.contactGroups.map(el => {
                    return el.bexioId;
                });
                chai_1.expect(groupIds).include(7);
            }
        });
    }));
    it('should edit a contact', () => __awaiter(this, void 0, void 0, function* () {
        return supertest(app)
            .post('/api/contacts')
            .set('Cookie', TestHelper_1.default.authenticatedCookies)
            .expect(200)
            .send(editContact)
            .then(res => {
            let contact = res.body;
            chai_1.expect(contact.collectionPoint).not.to.be.undefined;
            chai_1.expect(contact.entryDate).not.to.be.null;
            chai_1.expect(contact.exitDate).not.to.be.null;
            chai_1.expect(contact.bankName).not.to.be.null;
            chai_1.expect(contact.iban).not.to.be.null;
            chai_1.expect(contact.accountHolder).not.to.be.null;
            chai_1.expect(contact.collectionPoint.id).to.be.equal(editContact.collectionPointId);
            chai_1.expect(contact.entryDate).to.be.equal(editContact.entryDate);
            chai_1.expect(contact.exitDate).to.be.equal(editContact.exitDate);
            chai_1.expect(contact.bankName).to.be.equal(editContact.bankName);
            chai_1.expect(contact.iban).to.be.equal(editContact.iban);
            chai_1.expect(contact.accountHolder).to.be.equal(editContact.accountHolder);
        });
    }));
});
//# sourceMappingURL=ContactsController.js.map