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
const TestHelper_1 = __importDefault(require("../helpers/TestHelper"));
const supertest = require("supertest");
const chai_1 = require("chai");
const typeorm_1 = require("typeorm");
const BillingReport_1 = __importDefault(require("../../entities/BillingReport"));
describe('CompensationController', function () {
    this.timeout(5000);
    let app;
    let dbCompensation;
    let compensation;
    let bulk;
    before(() => __awaiter(this, void 0, void 0, function* () {
        app = TestHelper_1.default.app;
        compensation = {
            member: TestHelper_1.default.mockContact.id,
            amount: 200,
            date: '2019-04-20T00:00:00.000Z',
            description: 'Custom Compensation'
        };
        let billingReport = (yield typeorm_1.getManager().getRepository(BillingReport_1.default).findOne()) ||
            { id: 1, date: '2019-04-20' };
        bulk = {
            billingReportId: billingReport.id,
            entries: [
                {
                    id: TestHelper_1.default.mockContact.id,
                    date: billingReport.date,
                    from: '2019-04-19T06:00:00.000Z',
                    until: '2019-04-19T21:00:00.000Z',
                    charge: true
                },
                {
                    id: TestHelper_1.default.mockContact2.id,
                    date: billingReport.date,
                    from: '2019-04-19T06:00:00.000Z',
                    until: '2019-04-19T21:00:00.000Z',
                    charge: false
                }
            ]
        };
        return;
    }));
    it('should add a new custom compensation', () => __awaiter(this, void 0, void 0, function* () {
        return supertest(app)
            .put('/api/compensations')
            .set('Cookie', TestHelper_1.default.authenticatedAdminCookies)
            .expect(200)
            .send(compensation)
            .then(res => {
            dbCompensation = res.body;
            chai_1.expect(dbCompensation.member.id).to.be.equal(compensation.member);
            chai_1.expect(dbCompensation.creator.id).to.be.equal(1);
            chai_1.expect(dbCompensation.amount).to.be.equal(compensation.amount);
            chai_1.expect(dbCompensation.date).to.be.equal(compensation.date);
            chai_1.expect(dbCompensation.approved).to.be.true;
            chai_1.expect(dbCompensation.paied).to.be.false;
            chai_1.expect(dbCompensation.valutaDate).to.be.null;
            chai_1.expect(dbCompensation.payout).to.be.undefined;
            chai_1.expect(dbCompensation.description).to.be.equal(compensation.description);
            chai_1.expect(dbCompensation).not.to.have.ownProperty('billingReport');
            chai_1.expect(dbCompensation).not.to.have.ownProperty('dayHours');
            chai_1.expect(dbCompensation).not.to.have.ownProperty('nightHours');
            chai_1.expect(dbCompensation).not.to.have.ownProperty('from');
            chai_1.expect(dbCompensation).not.to.have.ownProperty('until');
            chai_1.expect(dbCompensation).not.to.have.ownProperty('charge');
        });
    }));
    it('should add a bulk of order compensations', () => __awaiter(this, void 0, void 0, function* () {
        return supertest(app)
            .put('/api/compensations/bulk')
            .set('Cookie', TestHelper_1.default.authenticatedAdminCookies)
            .expect(200)
            .send(bulk)
            .then(res => {
            chai_1.expect(res.body.length).to.be.equal(2);
            for (let i in res.body) {
                let rec = res.body[i];
                chai_1.expect(rec.member.id).to.be.equal(bulk.entries[i].id);
                chai_1.expect(rec.creator.id).to.be.equal(1);
                chai_1.expect(rec.date).to.be.equal(bulk.entries[i].date);
                chai_1.expect(rec.dayHours).to.be.equal(14);
                chai_1.expect(rec.nightHours).to.be.equal(1);
                chai_1.expect(rec.charge).to.be.equal(bulk.entries[i].charge);
                chai_1.expect(rec.from).to.be.equal(bulk.entries[i].from);
                chai_1.expect(rec.until).to.be.equal(bulk.entries[i].until);
                chai_1.expect(rec.billingReport.id).to.be.equal(bulk.billingReportId);
                chai_1.expect(rec.paied).to.be.false;
                chai_1.expect(rec.valutaDate).to.be.null;
                chai_1.expect(rec.payout).to.be.undefined;
            }
        });
    }));
    it('should approve the compensation', () => __awaiter(this, void 0, void 0, function* () {
        return supertest(app)
            .post('/api/compensations/approve')
            .set('Cookie', TestHelper_1.default.authenticatedAdminCookies)
            .expect(200)
            .send({ id: dbCompensation.id })
            .then(res => {
            chai_1.expect(res.body.success).to.be.true;
        });
    }));
    it('should delete the compensation', () => __awaiter(this, void 0, void 0, function* () {
        return supertest(app)
            .delete('/api/compensations')
            .set('Cookie', TestHelper_1.default.authenticatedAdminCookies)
            .expect(200)
            .send({ id: dbCompensation.id })
            .then(res => {
            chai_1.expect(res.body.deletedAt).not.to.be.null;
            chai_1.expect(res.body.deletedBy.id).to.be.equal(1);
        });
    }));
    it('should get all compensations', () => __awaiter(this, void 0, void 0, function* () {
        return supertest(app)
            .get('/api/compensations')
            .set('Cookie', TestHelper_1.default.authenticatedAdminCookies)
            .expect(200)
            .then(res => {
            chai_1.expect(res.body.length).to.be.greaterThan(0);
        });
    }));
    it('should get all for a specific member', () => __awaiter(this, void 0, void 0, function* () {
        return supertest(app)
            .get('/api/compensations/' + TestHelper_1.default.mockContact.id)
            .set('Cookie', TestHelper_1.default.authenticatedAdminCookies)
            .expect(200)
            .then(res => {
            chai_1.expect(res.body.length).to.be.greaterThan(0);
            for (let entry of res.body) {
                chai_1.expect(entry.member.id).to.be.equal(TestHelper_1.default.mockContact.id);
                chai_1.expect(entry.approved).to.be.true;
            }
        });
    }));
});
//# sourceMappingURL=CompensationController.js.map