import TestHelper from "../helpers/TestHelper";
import * as Express from 'express'
import supertest = require("supertest");
import { expect } from "chai";
import CustomCompensation from "../../entities/CustomCompensation";
import OrderCompensation from "../../entities/OrderCompensation";
import { getManager } from "typeorm";
import BillingReport from "../../entities/BillingReport";

describe('CompensationController', function () {
    this.timeout(5000)
    let app: Express.Application;
    let dbCompensation: CustomCompensation
    let compensation: {
        member: number,
        amount: number,
        date: string,
        description: string
    }

    let bulk: {
        billingReportId: number,
        entries: Array<{
            id: number,
            date: string,
            from: string,
            until: string,
            charge: boolean
        }>
    }

    before(async () => {
        app = TestHelper.app

        compensation = {
            member: TestHelper.mockContact.id,
            amount: 200,
            date: '2019-04-20T00:00:00.000Z',
            description: 'Custom Compensation'
        }

        let billingReport =
            (await getManager().getRepository(BillingReport).findOne()) ||
            { id: 1, date: '2019-04-20' }

        bulk = {
            billingReportId: billingReport.id,
            entries: [
                {
                    id: TestHelper.mockContact.id,
                    date: billingReport.date as unknown as string,
                    from: '2019-04-19T06:00:00.000Z',
                    until: '2019-04-19T21:00:00.000Z',
                    charge: true
                },
                {
                    id: TestHelper.mockContact2.id,
                    date: billingReport.date as unknown as string,
                    from: '2019-04-19T06:00:00.000Z',
                    until: '2019-04-19T21:00:00.000Z',
                    charge: false
                }
            ]
        }

        return
    })

    it('should add an approved compensation', async () => {
        return supertest(app)
            .put('/api/compensations')
            .set('Cookie', TestHelper.authenticatedAdminCookies)
            .expect(200)
            .send(compensation)
            .then(res => {
                dbCompensation = res.body
                expect(dbCompensation.member.id).to.be.equal(compensation.member)
                expect(dbCompensation.creator.id).to.be.equal(TestHelper.mockAdminUser.id)
                expect(dbCompensation.amount).to.be.equal(compensation.amount)
                expect(dbCompensation.date).to.be.equal(compensation.date)
                expect(dbCompensation.approved).to.be.true
                expect(dbCompensation.paied).to.be.false
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

    it('should add a non approved compensation', async () => {
        return supertest(app)
            .put('/api/compensations')
            .set('Cookie', TestHelper.authenticatedNonAdminCookies)
            .expect(200)
            .send(compensation)
            .then(res => {
                dbCompensation = res.body
                expect(dbCompensation.member.id).to.be.equal(compensation.member)
                expect(dbCompensation.creator.id).to.be.equal(TestHelper.mockUser.id)
                expect(dbCompensation.amount).to.be.equal(compensation.amount)
                expect(dbCompensation.date).to.be.equal(compensation.date)
                expect(dbCompensation.approved).to.be.false
                expect(dbCompensation.paied).to.be.false
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

    it('should add a bulk of order compensations', async () => {
        return supertest(app)
            .put('/api/compensations/bulk')
            .set('Cookie', TestHelper.authenticatedNonAdminCookies)
            .expect(200)
            .send(bulk)
            .then(res => {
                expect(res.body.length).to.be.equal(2)

                for (let i in (res.body as Array<CustomCompensation>)) {
                    let rec = res.body[i]
                    expect(rec.member.id).to.be.equal(bulk.entries[i].id)
                    expect(rec.creator.id).to.be.equal(TestHelper.mockUser.id)
                    expect(rec.date).to.be.equal(bulk.entries[i].date)
                    expect(rec.dayHours).to.be.equal(14)
                    expect(rec.nightHours).to.be.equal(1)
                    expect(rec.charge).to.be.equal(bulk.entries[i].charge)
                    expect(rec.from).to.be.equal(bulk.entries[i].from)
                    expect(rec.until).to.be.equal(bulk.entries[i].until)
                    expect(rec.billingReport.id).to.be.equal(bulk.billingReportId)

                    expect(rec.paied).to.be.false
                    expect(rec.payout).to.be.undefined

                }
            })
    })

    it('should approve the compensation', async () => {
        return supertest(app)
            .post('/api/compensations/approve')
            .set('Cookie', TestHelper.authenticatedNonAdminCookies)
            .expect(200)
            .send({ id: dbCompensation.id })
            .then(res => {
                expect(res.body.success).to.be.true
            })
    })

    it('should delete the compensation', async () => {
        return supertest(app)
            .delete('/api/compensations')
            .set('Cookie', TestHelper.authenticatedNonAdminCookies)
            .expect(200)
            .send({ id: dbCompensation.id })
            .then(res => {
                expect(res.body.deletedAt).not.to.be.null
                expect(res.body.deletedBy.id).to.be.equal(TestHelper.mockUser.id)
            })
    })

    it('should get all compensations', async () => {
        return supertest(app)
            .get('/api/compensations')
            .set('Cookie', TestHelper.authenticatedNonAdminCookies)
            .expect(200)
            .then(res => {
                expect(res.body.length).to.be.greaterThan(0)
            })
    })

    it('should get all for a specific member', async () => {
        return supertest(app)
            .get('/api/compensations/' + TestHelper.mockContact.id)
            .set('Cookie', TestHelper.authenticatedNonAdminCookies)
            .expect(200)
            .then(res => {
                expect(res.body.length).to.be.greaterThan(0)
                for (let entry of (res.body as Array<OrderCompensation | CustomCompensation>)) {
                    expect(entry.member.id).to.be.equal(TestHelper.mockContact.id)
                }
            })
    })

    describe('errors', () => {
        it('it should fail to delete the non existing compensation', async () => {
            return supertest(app)
                .delete('/api/compensations')
                .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                .expect(500)
                .send({ id: -1 })
        })

        it('should fial to add with no valid user provided', async () => {
            return supertest(app)
                .put('/api/compensations')
                .set('Cookie', TestHelper.authenticatedAdminCookies)
                .expect(500)
                .send({ ...compensation, member: -1 })
        })

        it('should not allow bulk for non permitted users', async () => {
            return supertest(app)
                .put('/api/compensations/bulk')
                .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                .expect(403)
                .send({ ...bulk, billingReportId: undefined })
        })

        it('should fail bulk with non valid billingReportId', async () => {
            return supertest(app)
                .put('/api/compensations/bulk')
                .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                .expect(500)
                .send({ ...bulk, billingReportId: -1 })
        })

        it('should fail to approve the compensation', async () => {
            return supertest(app)
                .post('/api/compensations/approve')
                .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                .expect(500)
                .send({ id: -1 })
        })
    })
})
