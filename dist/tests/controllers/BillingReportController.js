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
describe('BillingReportController', function () {
    this.timeout(5000);
    let app;
    let dbReport;
    let report;
    before(() => {
        app = TestHelper_1.default.app;
        report = {
            orderId: TestHelper_1.default.mockOrder.id,
            els: [TestHelper_1.default.mockContact],
            drivers: [TestHelper_1.default.mockContact],
            date: '2019-04-19T00:00:00.000Z',
            compensationEntries: {},
            food: true,
            remarks: '',
            creatorId: TestHelper_1.default.mockUser.id
        };
        //@ts-ignore
        report.compensationEntries[TestHelper_1.default.mockContact.id] = {
            from: '2019-04-19T06:00:00.000Z',
            until: '2019-04-19T21:00:00.000Z',
            charge: true
        };
    });
    it('should send me all the open orders with the necessary attributes', function () {
        let now = new Date();
        let before14Days = new Date();
        before14Days.setDate(before14Days.getDate() - 14);
        return supertest(app)
            .get('/api/billing-reports/open')
            .set('Cookie', TestHelper_1.default.authenticatedCookies)
            .expect(200)
            .then(res => {
            chai_1.expect(res.body).to.be.string;
            let data = res.body;
            chai_1.expect(data).to.has.ownProperty('length');
            chai_1.expect(data.length).to.be.greaterThan(0);
            for (let order of data) {
                chai_1.expect(order).to.has.ownProperty('documentNr');
                chai_1.expect(order).to.has.ownProperty('id');
                chai_1.expect(order).to.has.ownProperty('title');
                chai_1.expect(order).to.has.ownProperty('contact');
                chai_1.expect(order.contact).to.has.ownProperty('lastname');
                chai_1.expect(order.execDates).to.has.ownProperty('length');
                chai_1.expect(order.execDates.map(date => {
                    if (new Date(date) >= before14Days)
                        return true;
                    return false;
                })).includes(true);
            }
        });
    });
    it('should create a new billing report', () => __awaiter(this, void 0, void 0, function* () {
        return supertest(app)
            .put('/api/billing-reports')
            .set('Cookie', TestHelper_1.default.authenticatedCookies)
            .expect(200)
            .send(report)
            .then(res => {
            let reportres = res.body;
            chai_1.expect(reportres.creator.id).to.be.equal(1);
            chai_1.expect(reportres.order.id).to.be.equal(report.orderId);
            chai_1.expect(reportres.els.length).to.be.equal(1);
            chai_1.expect(reportres.els[0].id).to.be.equal(report.els[0].id);
            chai_1.expect(reportres.drivers.length).to.be.equal(1);
            chai_1.expect(reportres.drivers[0].id).to.be.equal(report.drivers[0].id);
            chai_1.expect(reportres.date).to.be.equal(report.date);
            chai_1.expect(reportres.food).to.be.equal(report.food);
            chai_1.expect(reportres.state).to.be.equal('pending');
            chai_1.expect(reportres.remarks).to.be.equal(report.remarks);
            chai_1.expect(reportres.compensations.length).to.be.equal(1);
            chai_1.expect(reportres.compensations[0].member.id).to.be.equal(TestHelper_1.default.mockContact.id);
            //@ts-ignore
            chai_1.expect(reportres.compensations[0].from).to.be.equal(report.compensationEntries[TestHelper_1.default.mockContact.id].from);
            //@ts-ignore
            chai_1.expect(reportres.compensations[0].until).to.be.equal(report.compensationEntries[TestHelper_1.default.mockContact.id].until);
            //@ts-ignore
            chai_1.expect(reportres.compensations[0].charge).to.be.equal(report.compensationEntries[TestHelper_1.default.mockContact.id].charge);
            chai_1.expect(reportres.compensations[0].paied).to.be.equal(false);
            chai_1.expect(reportres.compensations[0].payout).to.be.equal(undefined);
            chai_1.expect(reportres.compensations[0].amount).to.be.equal(155);
            chai_1.expect(reportres.compensations[0].approved).to.be.equal(false);
            chai_1.expect(reportres.compensations[0].creator.id).to.be.equal(1);
            chai_1.expect(reportres.compensations[0].date).to.be.equal(report.date);
            chai_1.expect(reportres.compensations[0].dayHours).to.be.equal(14);
            chai_1.expect(reportres.compensations[0].nightHours).to.be.equal(1);
            chai_1.expect(reportres.compensations[0].valutaDate).to.be.equal(null);
            dbReport = reportres;
        });
    }));
    it('should return all billing reports ', () => __awaiter(this, void 0, void 0, function* () {
        return supertest(app)
            .get('/api/billing-reports')
            .set('Cookie', TestHelper_1.default.authenticatedCookies)
            .expect(200)
            .then(res => {
            let reportres = res.body[res.body.length - 1];
            chai_1.expect(reportres.creator.id).to.be.equal(1);
            chai_1.expect(reportres.order.id).to.be.equal(report.orderId);
            chai_1.expect(reportres.els.length).to.be.equal(1);
            chai_1.expect(reportres.els[0].id).to.be.equal(report.els[0].id);
            chai_1.expect(reportres.drivers.length).to.be.equal(1);
            chai_1.expect(reportres.drivers[0].id).to.be.equal(report.drivers[0].id);
            chai_1.expect(reportres.date).to.be.equal('2019-04-19');
            chai_1.expect(reportres.food).to.be.equal(report.food);
            chai_1.expect(reportres.state).to.be.equal('pending');
            chai_1.expect(reportres.remarks).to.be.equal(report.remarks);
            chai_1.expect(reportres.compensations.length).to.be.equal(1);
            chai_1.expect(reportres.compensations[0].member.id).to.be.equal(TestHelper_1.default.mockContact.id);
            //@ts-ignore
            chai_1.expect(reportres.compensations[0].from).to.be.equal(report.compensationEntries[TestHelper_1.default.mockContact.id].from);
            //@ts-ignore
            chai_1.expect(reportres.compensations[0].until).to.be.equal(report.compensationEntries[TestHelper_1.default.mockContact.id].until);
            //@ts-ignore
            chai_1.expect(reportres.compensations[0].charge).to.be.equal(report.compensationEntries[TestHelper_1.default.mockContact.id].charge);
            chai_1.expect(reportres.compensations[0].paied).to.be.equal(false);
            chai_1.expect(reportres.compensations[0].payout).to.be.equal(undefined);
            chai_1.expect(reportres.compensations[0].amount).to.be.equal('155.00');
            chai_1.expect(reportres.compensations[0].approved).to.be.equal(false);
            chai_1.expect(reportres.compensations[0].date).to.be.equal('2019-04-19');
            chai_1.expect(reportres.compensations[0].dayHours).to.be.equal(14);
            chai_1.expect(reportres.compensations[0].nightHours).to.be.equal(1);
            chai_1.expect(reportres.compensations[0].valutaDate).to.be.equal(null);
        });
    }));
    it('should approve the report', () => __awaiter(this, void 0, void 0, function* () {
        return supertest(app)
            .post('/api/billing-reports/approve')
            .set('Cookie', TestHelper_1.default.authenticatedCookies)
            .expect(200)
            .send(dbReport)
            .then(res => {
            chai_1.expect(res.body.state).to.be.equal('approved');
        });
    }));
    it('should decline the report', () => __awaiter(this, void 0, void 0, function* () {
        return supertest(app)
            .post('/api/billing-reports/decline')
            .set('Cookie', TestHelper_1.default.authenticatedCookies)
            .expect(200)
            .send(dbReport)
            .then(res => {
            chai_1.expect(res.body.state).to.be.equal('declined');
        });
    }));
    it('should edit the reports date report', () => __awaiter(this, void 0, void 0, function* () {
        dbReport.date = new Date('2019-04-20T00:00:00.000Z');
        return supertest(app)
            .post('/api/billing-reports')
            .set('Cookie', TestHelper_1.default.authenticatedCookies)
            .expect(200)
            .send(dbReport)
            .then(res => {
            chai_1.expect(res.body.date).to.be.equal('2019-04-20T00:00:00.000Z');
        });
    }));
});
//# sourceMappingURL=BillingReportController.js.map