import TestHelper from "../helpers/TestHelper";
import * as Express from 'express'
import supertest = require("supertest");
import { expect } from "chai";
import CustomCompensation from "../../entities/CustomCompensation";
import Compensation from "../../entities/Compensation";
import OrderCompensation from "../../entities/OrderCompensation";

describe('CompensationController', function () {
    this.timeout(5000)
    let app: Express.Application;
    let dbCompensation: CustomCompensation
    let compensation = {
        member: 1,
        amount: 200,
        date: '2019-04-20T00:00:00.000Z',
        description: 'Custom Compensation'
    }

    let bulk = {
        billingReportId: 1,
        entries: [
            {
                id: 4,
                date: '2019-04-19',
                from: '2019-04-19T07:00:00.000Z',
                until: '2019-04-19T22:00:00.000Z',
                charge: true
            },
            {
                id: 5,
                date: '2019-04-19',
                from: '2019-04-19T07:00:00.000Z',
                until: '2019-04-19T22:00:00.000Z',
                charge: false
            }
        ]
    }

    before(() => {
        app = TestHelper.app
    })

    it('add', async () => {
        return supertest(app)
            .put('/api/compensations')
            .set('Cookie', TestHelper.authenticatedCookies)
            .expect(200)
            .send(compensation)
            .then(res => {
                dbCompensation = res.body
                expect(dbCompensation.member.id).to.be.equal(compensation.member)
                expect(dbCompensation.creator.id).to.be.equal(1)
                expect(dbCompensation.amount).to.be.equal(compensation.amount)
                expect(dbCompensation.date).to.be.equal(compensation.date)
                expect(dbCompensation.approved).to.be.true
                expect(dbCompensation.paied).to.be.false
                expect(dbCompensation.valutaDate).to.be.null
                expect(dbCompensation.payout).to.be.undefined
                expect(dbCompensation.description).to.be.equal(compensation.description)

                expect(dbCompensation).not.to.have.ownProperty('billingReport')
                expect(dbCompensation).not.to.have.ownProperty('dayHours')
                expect(dbCompensation).not.to.have.ownProperty('nightHours')
                expect(dbCompensation).not.to.have.ownProperty('from')
                expect(dbCompensation).not.to.have.ownProperty('until')
                expect(dbCompensation).not.to.have.ownProperty('charge')
            })
    })

    it('add bulk', async () => {
        return supertest(app)
            .put('/api/compensations/bulk')
            .set('Cookie', TestHelper.authenticatedCookies)
            .expect(200)
            .send(bulk)
            .then(res => {
                expect(res.body.length).to.be.equal(2)

                for (let i in (res.body as Array<CustomCompensation>)) {
                    let rec = res.body[i]
                    expect(rec.member.id).to.be.equal(bulk.entries[i].id)
                    expect(rec.creator.id).to.be.equal(1)
                    expect(rec.date).to.be.equal(bulk.entries[i].date)
                    expect(rec.dayHours).to.be.equal(14)
                    expect(rec.nightHours).to.be.equal(1)
                    expect(rec.charge).to.be.equal(bulk.entries[i].charge)
                    expect(rec.from).to.be.equal(bulk.entries[i].from)
                    expect(rec.until).to.be.equal(bulk.entries[i].until)
                    expect(rec.billingReport.id).to.be.equal(bulk.billingReportId)

                    expect(rec.paied).to.be.false
                    expect(rec.valutaDate).to.be.null
                    expect(rec.payout).to.be.undefined

                }
            })
    })

    it('approve', async () => {
        return supertest(app)
            .post('/api/compensations/approve')
            .set('Cookie', TestHelper.authenticatedCookies)
            .expect(200)
            .send({ id: dbCompensation.id })
            .then(res => {
                expect(res.body.success).to.be.true
            })
    })

    it('delete', async () => {
        return supertest(app)
            .delete('/api/compensations')
            .set('Cookie', TestHelper.authenticatedCookies)
            .expect(200)
            .send({ id: dbCompensation.id })
            .then(res => {
                expect(res.body.deletedAt).not.to.be.null
                expect(res.body.deletedBy.id).to.be.equal(1)
            })
    })

    it('get all', async () => {
        return supertest(app)
            .get('/api/compensations')
            .set('Cookie', TestHelper.authenticatedCookies)
            .expect(200)
            .then(res => {
                expect(res.body.length).to.be.greaterThan(0)
            })
    })

    it('get for member', async () => {
        return supertest(app)
            .get('/api/compensations/1')
            .set('Cookie', TestHelper.authenticatedCookies)
            .expect(200)
            .then(res => {
                expect(res.body.length).to.be.greaterThan(0)
                for(let entry of (res.body as Array<OrderCompensation | CustomCompensation>)) {
                    expect(entry.member.id).to.be.equal(1)
                    expect(entry.approved).to.be.true
                }
            })
    })
})
