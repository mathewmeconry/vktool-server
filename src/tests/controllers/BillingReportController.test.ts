import * as Express from 'express'
import TestHelper from '../helpers/TestHelper';
import supertest = require('supertest');
import { expect } from 'chai';
import Order from '../../entities/Order';
import BillingReport from '../../entities/BillingReport';
import Contact from '../../entities/Contact';


describe('BillingReportController', function () {
    this.timeout(5000)
    let app: Express.Application;
    let dbReport: BillingReport
    let report: {
        orderId: number,
        date: string,
        els: Array<Contact>,
        drivers: Array<Contact>,
        food: boolean,
        remarks: string,
        compensationEntries: {
            [index: string]: {
                id: number,
                member: Contact,
                from: string,
                until: string,
                charge: boolean,
                totalHours: number
            }
        },
        creatorId: number
    };

    before(() => {
        app = TestHelper.app
        report = {
            orderId: TestHelper.mockOrder.id,
            els: [TestHelper.mockContact],
            drivers: [TestHelper.mockContact],
            date: '2019-04-19T00:00:00.000Z',
            compensationEntries: {},
            food: true,
            remarks: '',
            creatorId: TestHelper.mockUser.id
        }
        //@ts-ignore
        report.compensationEntries[TestHelper.mockContact.id] = Object.assign({}, TestHelper.mockContact, {
            from: '2019-04-19T06:00:00.000Z',
            until: '2019-04-19T21:00:00.000Z',
            charge: true
        })
    })

    it('should send me all the open orders with the necessary attributes', function () {
        let now = new Date()
        let before14Days = new Date()
        before14Days.setDate(before14Days.getDate() - 14)

        return supertest(app)
            .get('/api/billing-reports/open')
            .set('Cookie', TestHelper.authenticatedNonAdminCookies)
            .expect(200)
            .then(res => {
                expect(res.body).to.be.string
                let data: Array<Order> = res.body
                expect(data).to.has.ownProperty('length')
                expect(data.length).to.be.greaterThan(0)

                for (let order of data) {
                    expect(order).to.has.ownProperty('documentNr')
                    expect(order).to.has.ownProperty('id')
                    expect(order).to.has.ownProperty('title')
                    expect(order).to.has.ownProperty('contact')
                    expect(order.contact).to.has.ownProperty('lastname')

                    expect(order.execDates).to.has.ownProperty('length')
                    expect(order.execDates.map(date => {
                        if (new Date(date) >= before14Days) return true
                        return false
                    })).includes(true)
                }
            })
    })

    it('should create a new billing report', async () => {
        return supertest(app)
            .put('/api/billing-reports')
            .set('Cookie', TestHelper.authenticatedNonAdminCookies)
            .expect(200)
            .send(report)
            .then(res => {
                let reportres: BillingReport = res.body
                expect(reportres.creator.id).to.be.equal(TestHelper.mockUser.id)
                expect(reportres.order.id).to.be.equal(report.orderId)
                expect(reportres.els.length).to.be.equal(1)
                expect(reportres.els[0].id).to.be.equal(report.els[0].id)
                expect(reportres.drivers.length).to.be.equal(1)
                expect(reportres.drivers[0].id).to.be.equal(report.drivers[0].id)
                expect(reportres.date).to.be.equal(report.date)
                expect(reportres.food).to.be.equal(report.food)
                expect(reportres.state).to.be.equal('pending')
                expect(reportres.remarks).to.be.equal(report.remarks)

                expect(reportres.compensations.length).to.be.equal(1)
                expect(reportres.compensations[0].member.id).to.be.equal(TestHelper.mockContact.id)
                //@ts-ignore
                expect(reportres.compensations[0].from).to.be.equal(report.compensationEntries[TestHelper.mockContact.id].from)
                //@ts-ignore
                expect(reportres.compensations[0].until).to.be.equal(report.compensationEntries[TestHelper.mockContact.id].until)
                //@ts-ignore
                expect(reportres.compensations[0].charge).to.be.equal(report.compensationEntries[TestHelper.mockContact.id].charge)
                expect(reportres.compensations[0].paied).to.be.equal(false)
                expect(reportres.compensations[0].payout).to.be.equal(undefined)
                expect(reportres.compensations[0].amount).to.be.equal(155)
                expect(reportres.compensations[0].approved).to.be.equal(false)
                expect(reportres.compensations[0].creator.id).to.be.equal(TestHelper.mockUser.id)
                expect(reportres.compensations[0].date).to.be.equal(report.date)
                expect(reportres.compensations[0].dayHours).to.be.equal(14)
                expect(reportres.compensations[0].nightHours).to.be.equal(1)

                dbReport = reportres
            })
    })

    describe('read', () => {
        it('should return all billing reports ', async () => {
            return supertest(app)
                .get('/api/billing-reports')
                .set('Cookie', TestHelper.authenticatedAdminCookies)
                .expect(200)
                .then(res => {
                    let reportres: BillingReport = res.body[res.body.length - 1]
                    expect(reportres.creator.id).to.be.equal(TestHelper.mockUser.id)
                    expect(reportres.order.id).to.be.equal(report.orderId)
                    expect(reportres.els.length).to.be.equal(1)
                    expect(reportres.els[0].id).to.be.equal(report.els[0].id)
                    expect(reportres.drivers.length).to.be.equal(1)
                    expect(reportres.drivers[0].id).to.be.equal(report.drivers[0].id)
                    expect(reportres.date).to.be.equal('2019-04-19')
                    expect(reportres.food).to.be.equal(report.food)
                    expect(reportres.state).to.be.equal('pending')
                    expect(reportres.remarks).to.be.equal(report.remarks)

                    expect(reportres.compensations.length).to.be.equal(1)
                    expect(reportres.compensations[0].member.id).to.be.equal(TestHelper.mockContact.id)
                    //@ts-ignore
                    expect(reportres.compensations[0].from).to.be.equal(report.compensationEntries[TestHelper.mockContact.id].from)
                    //@ts-ignore
                    expect(reportres.compensations[0].until).to.be.equal(report.compensationEntries[TestHelper.mockContact.id].until)
                    //@ts-ignore
                    expect(reportres.compensations[0].charge).to.be.equal(report.compensationEntries[TestHelper.mockContact.id].charge)
                    expect(reportres.compensations[0].paied).to.be.equal(false)
                    expect(reportres.compensations[0].payout).to.be.equal(undefined)
                    expect(reportres.compensations[0].amount).to.be.equal(155)
                    expect(reportres.compensations[0].approved).to.be.equal(false)
                    expect(reportres.compensations[0].date).to.be.equal('2019-04-19T00:00:00.000Z')
                    expect(reportres.compensations[0].dayHours).to.be.equal(14)
                    expect(reportres.compensations[0].nightHours).to.be.equal(1)
                })
        })

        it('should return only my billing reports ', async () => {
            return supertest(app)
                .get('/api/billing-reports')
                .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                .expect(200)
                .then(res => {
                    for (const report of (res.body as BillingReport[])) {
                        expect(report.creator.id).to.be.eq(TestHelper.mockUser.id)
                    }
                })
        })
    })

    describe('approve/decline/reset', () => {
        it('should approve the report', async () => {
            return supertest(app)
                .post('/api/billing-reports/approve')
                .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                .expect(200)
                .send({ id: dbReport.id })
                .then(res => {
                    expect((res.body as BillingReport).state).to.be.equal('approved')
                })
        })

        it('should decline the report', async () => {
            return supertest(app)
                .post('/api/billing-reports/decline')
                .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                .expect(200)
                .send(dbReport)
                .then(res => {
                    expect((res.body as BillingReport).state).to.be.equal('declined')
                })
        })

        it('should reset the report', async () => {
            return supertest(app)
                .post('/api/billing-reports/reset')
                .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                .expect(200)
                .send(dbReport)
                .then(res => {
                    expect((res.body as BillingReport).state).to.be.equal('pending')
                })
        })

        it('should return 403', async () => {
            return supertest(app)
                .post('/api/billing-reports/approve?bypass=false')
                .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                .expect(403)
                .send(dbReport)
        })

        it('should return 500', async () => {
            return supertest(app)
                .post('/api/billing-reports/approve')
                .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                .expect(500)
                .send({ id: -2 })
        })
    })

    describe('edit', () => {
        it('should edit the report date ', async () => {
            dbReport.date = new Date('2019-04-01T00:00:00.000Z')
            return supertest(app)
                .post('/api/billing-reports')
                .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                .expect(200)
                .send(dbReport)
                .then(res => {
                    expect((res.body as BillingReport).date).to.be.equal('2019-04-01T00:00:00.000Z')
                })
        })


        it('should edit the report date', async () => {
            dbReport.date = new Date('2019-04-20T00:00:00.000Z')
            return supertest(app)
                .post('/api/billing-reports')
                .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                .expect(200)
                .send(dbReport)
                .then(res => {
                    expect((res.body as BillingReport).date).to.be.equal('2019-04-20T00:00:00.000Z')
                })
        })

        it('should prevent from editing', async () => {
            // approve again to trigger error
            await supertest(app)
                .post('/api/billing-reports/approve')
                .set('Cookie', TestHelper.authenticatedAdminCookies)
                .expect(200)
                .send(dbReport)

            return supertest(app)
                .post('/api/billing-reports')
                .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                .expect(403)
                .send(dbReport)
        })

        it('should return 500 with no payload', async () => {
            return supertest(app)
                .post('/api/billing-reports')
                .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                .expect(500)
                .send({})
        })

        it('should return 500 with wrong report id', async () => {
            return supertest(app)
                .post('/api/billing-reports')
                .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                .expect(500)
                .send({ id: Infinity })
        })
    })
})