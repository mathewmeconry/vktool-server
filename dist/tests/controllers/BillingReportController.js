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
    before(() => {
        app = TestHelper_1.default.app;
    });
    it('get open orders', function () {
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
    it('create report', () => __awaiter(this, void 0, void 0, function* () {
        let report = {
            creatorId: 1,
            orderId: 1,
            els: [{ id: 1 }],
            drivers: [{ id: 1 }],
            date: '2019-04-19T00:00:00.000Z',
            compensationEntries: {
                '2': {
                    from: '2019-04-19T07:00:00.000Z',
                    until: '2019-04-19T22:00:00.000Z',
                    charge: true
                }
            },
            food: true,
            remarks: ''
        };
        return supertest(app)
            .put('/api/billing-reports')
            .set('Cookie', TestHelper_1.default.authenticatedCookies)
            .expect(200)
            .send(report)
            .then(res => {
            console.log(res.body);
            let reportres = res.body;
            chai_1.expect(reportres.creator.id).to.be.equal(report.creatorId);
            chai_1.expect(reportres.order.id).to.be.equal(report.orderId);
            chai_1.expect(reportres.els).to.have.length(1);
            chai_1.expect(reportres.els[0].id).to.be.equal(report.els[0].id);
            chai_1.expect(reportres.drivers).to.have.length(1);
            chai_1.expect(reportres.drivers[0].id).to.be.equal(report.drivers[0].id);
            chai_1.expect(reportres.date).to.be.equal(report.date);
            chai_1.expect(reportres.food).to.be.equal(report.food);
            chai_1.expect(reportres.remarks).to.be.equal(report.remarks);
            chai_1.expect(reportres.compensations).to.have.length(1);
            chai_1.expect(reportres.compensations[0].member.id).to.be.equal(2);
            chai_1.expect(reportres.compensations[0].from).to.be.equal(report.compensationEntries['2'].from);
            chai_1.expect(reportres.compensations[0].until).to.be.equal(report.compensationEntries['2'].until);
            chai_1.expect(reportres.compensations[0].charge).to.be.equal(report.compensationEntries['2'].charge);
            chai_1.expect(reportres.compensations[0].paied).to.be.equal(false);
            chai_1.expect(reportres.compensations[0].payout).to.be.equal(undefined);
            chai_1.expect(reportres.compensations[0].amount).to.be.equal(155);
            chai_1.expect(reportres.compensations[0].approved).to.be.equal(false);
            chai_1.expect(reportres.compensations[0].creator).to.be.equal(report.creatorId);
            chai_1.expect(reportres.compensations[0].date).to.be.equal(report.date);
            chai_1.expect(reportres.compensations[0].dayHours).to.be.equal(14);
            chai_1.expect(reportres.compensations[0].nightHours).to.be.equal(1);
            chai_1.expect(reportres.compensations[0].valutaDate).to.be.equal(undefined);
        });
    }));
    it('get reports', () => __awaiter(this, void 0, void 0, function* () {
        throw new Error('Not defined');
    }));
    it('approve report', () => __awaiter(this, void 0, void 0, function* () {
        throw new Error('Not defined');
    }));
    it('decline report', () => __awaiter(this, void 0, void 0, function* () {
        throw new Error('Not defined');
    }));
    it('edit report', () => __awaiter(this, void 0, void 0, function* () {
        throw new Error('Not defined');
    }));
});
//# sourceMappingURL=BillingReportController.js.map