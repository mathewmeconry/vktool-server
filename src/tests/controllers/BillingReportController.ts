import * as Express from 'express'
import TestHelper from '../helpers/TestHelper';
import supertest = require('supertest');
import { expect } from 'chai';
import Order from '../../entities/Order';
import BillingReport from '../../entities/BillingReport';


describe('BillingReportController', function () {
    this.timeout(5000)
    let app: Express.Application;
    let dbReport: BillingReport
    let report = {
        orderId: 2,
        els: [{ id: 3 }],
        drivers: [{ id: 4 }],
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
    }

    before(() => {
        app = TestHelper.app
    })

    it('get open orders', function () {
        let now = new Date()
        let before14Days = new Date()
        before14Days.setDate(before14Days.getDate() - 14)

        return supertest(app)
            .get('/api/billing-reports/open')
            .set('Cookie', TestHelper.authenticatedCookies)
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

    it('create report', async () => {
        return supertest(app)
            .put('/api/billing-reports')
            .set('Cookie', TestHelper.authenticatedCookies)
            .expect(200)
            .send(report)
            .then(res => {
                let reportres: BillingReport = res.body
                expect(reportres.creator.id).to.be.equal(1)
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
                expect(reportres.compensations[0].member.id).to.be.equal(2)
                expect(reportres.compensations[0].from).to.be.equal(report.compensationEntries['2'].from)
                expect(reportres.compensations[0].until).to.be.equal(report.compensationEntries['2'].until)
                expect(reportres.compensations[0].charge).to.be.equal(report.compensationEntries['2'].charge)
                expect(reportres.compensations[0].paied).to.be.equal(false)
                expect(reportres.compensations[0].payout).to.be.equal(undefined)
                expect(reportres.compensations[0].amount).to.be.equal(155)
                expect(reportres.compensations[0].approved).to.be.equal(false)
                expect(reportres.compensations[0].creator.id).to.be.equal(1)
                expect(reportres.compensations[0].date).to.be.equal(report.date)
                expect(reportres.compensations[0].dayHours).to.be.equal(14)
                expect(reportres.compensations[0].nightHours).to.be.equal(1)
                expect(reportres.compensations[0].valutaDate).to.be.equal(null)

                dbReport = reportres
            })
    })

    it('get reports', async () => {
        return supertest(app)
            .get('/api/billing-reports')
            .set('Cookie', TestHelper.authenticatedCookies)
            .expect(200)
            .then(res => {
                let reportres: BillingReport = res.body[res.body.length - 1]
                expect(reportres.creator.id).to.be.equal(1)
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
                expect(reportres.compensations[0].member.id).to.be.equal(2)
                expect(reportres.compensations[0].from).to.be.equal(report.compensationEntries['2'].from)
                expect(reportres.compensations[0].until).to.be.equal(report.compensationEntries['2'].until)
                expect(reportres.compensations[0].charge).to.be.equal(report.compensationEntries['2'].charge)
                expect(reportres.compensations[0].paied).to.be.equal(false)
                expect(reportres.compensations[0].payout).to.be.equal(undefined)
                expect(reportres.compensations[0].amount).to.be.equal('155.00')
                expect(reportres.compensations[0].approved).to.be.equal(false)
                expect(reportres.compensations[0].date).to.be.equal('2019-04-19')
                expect(reportres.compensations[0].dayHours).to.be.equal(14)
                expect(reportres.compensations[0].nightHours).to.be.equal(1)
                expect(reportres.compensations[0].valutaDate).to.be.equal(null)
            })
    })

    it('approve report', async () => {
        return supertest(app)
            .post('/api/billing-reports/approve')
            .set('Cookie', TestHelper.authenticatedCookies)
            .expect(200)
            .send(dbReport)
            .then(res => {
                expect((res.body as BillingReport).state).to.be.equal('approved')
            })
    })

    it('decline report', async () => {
        return supertest(app)
            .post('/api/billing-reports/decline')
            .set('Cookie', TestHelper.authenticatedCookies)
            .expect(200)
            .send(dbReport)
            .then(res => {
                expect((res.body as BillingReport).state).to.be.equal('declined')
            })
    })

    it('edit report', async () => {
        dbReport.date = new Date('2019-04-20T00:00:00.000Z')
        return supertest(app)
            .post('/api/billing-reports')
            .set('Cookie', TestHelper.authenticatedCookies)
            .expect(200)
            .send(dbReport)
            .then(res => {
                expect((res.body as BillingReport).date).to.be.equal('2019-04-20T00:00:00.000Z')
            })
    })
})