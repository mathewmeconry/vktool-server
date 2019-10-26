import { expect } from "chai";
import config = require("config");
import * as Express from 'express'
import supertest = require("supertest");
import TestHelper from "../helpers/TestHelper";
import Payout from "../../entities/Payout";

describe('PayoutController', () => {
    let app: Express.Application;
    let dbPayout: Payout
    const payout = {
        until: '2030-01-01',
        from: '1994-09-25'
    }

    before(() => {
        app = TestHelper.app
    })

    describe('payout creation', () => {
        it('should create a full payout', async () => {
            return supertest(app)
                .put('/api/payouts')
                .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                .expect(200)
                .send(payout)
                .then(res => {
                    dbPayout = res.body as Payout
                    expect(dbPayout.from).to.be.eq(payout.from)
                    expect(dbPayout.until).to.be.eq(payout.until)
                    expect(dbPayout.compensations.length).to.be.greaterThan(0)
                    expect(dbPayout.total).to.be.eq(dbPayout.compensations.map(c => c.amount).reduce((a = 0, b) => a + b))
                })
        })

        it('should create a payout without from', async () => {
            return supertest(app)
                .put('/api/payouts')
                .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                .expect(200)
                .send({ until: payout.until })
                .then(res => {
                    const p: Payout = res.body as Payout
                    expect(p.until).to.be.eq(payout.until)
                })
        })

        it('should fail with 402', async () => {
            return supertest(app)
                .put('/api/payouts')
                .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                .expect(402)
                .send({ from: payout.from })
        })
    })

    describe('get payouts', () => {
        it('should return all payouts', async () => {
            return supertest(app)
                .get('/api/payouts')
                .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                .expect(200)
                .then(res => {
                    const ps = res.body as Payout[]
                    expect(ps.length).to.be.greaterThan(0)
                })
        })
    })

    describe('reclaim', () => {
        before('create a new compensation', async () => {
            return supertest(app)
                .put('/api/compensations')
                .set('Cookie', TestHelper.authenticatedAdminCookies)
                .expect(200)
                .send({
                    member: TestHelper.mockContact.id,
                    amount: 200,
                    date: '2019-04-20T00:00:00.000Z',
                    description: 'Custom Compensation for reclaim'
                })
        })

        it('should reclaim all pending compensations', async () => {
            return supertest(app)
                .post('/api/payouts/reclaim')
                .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                .expect(200)
                .send({ id: dbPayout.id })
                .then(res => {
                    const p = res.body as Payout
                    expect(p.compensations.length).to.be.greaterThan(dbPayout.compensations.length)
                    expect(p.total).to.be.greaterThan(dbPayout.total)
                })
        })

        it('should return a 402', async () => {
            return supertest(app)
                .post('/api/payouts/reclaim')
                .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                .expect(402)
                .send({})
        })

        it('should return a 500', async () => {
            return supertest(app)
                .post('/api/payouts/reclaim')
                .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                .expect(500)
                .send({ id: -1 })
        })
    })

    describe('member reports', () => {
        describe('pdf', () => {
            it('GET params', async () => {
                return supertest(app)
                    .get(`/api/payouts/${dbPayout.id}/${dbPayout.compensations[0].memberId}/pdf`)
                    .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                    .expect(200)
            })

            it('POST params', async () => {
                return supertest(app)
                    .get(`/api/payouts/member/pdf`)
                    .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                    .send({ payoutId: dbPayout.id, memberId: dbPayout.compensations[0].memberId })
                    .expect(200)
            })

            it('missing POST payoutId param', async () => {
                return supertest(app)
                    .get(`/api/payouts/member/pdf`)
                    .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                    .send({ memberId: dbPayout.compensations[0].memberId })
                    .expect(402)
            })

            it('missing POST memberId param', async () => {
                return supertest(app)
                    .get(`/api/payouts/member/pdf`)
                    .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                    .send({ payoutId: dbPayout.id })
                    .expect(200)
            })
        })

        describe('html', () => {
            it('GET params', async () => {
                return supertest(app)
                    .get(`/api/payouts/${dbPayout.id}/${dbPayout.compensations[0].memberId}/html`)
                    .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                    .expect(200)
            })

            it('POST params', async () => {
                return supertest(app)
                    .get(`/api/payouts/member/html`)
                    .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                    .send({ payoutId: dbPayout.id, memberId: dbPayout.compensations[0].memberId })
                    .expect(200)
            })

            it('missing POST payoutId param', async () => {
                return supertest(app)
                    .get(`/api/payouts/member/html`)
                    .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                    .send({ memberId: dbPayout.compensations[0].memberId })
                    .expect(402)
            })

            it('missing POST memberId param', async () => {
                return supertest(app)
                    .get(`/api/payouts/member/html`)
                    .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                    .send({ payoutId: dbPayout.id })
                    .expect(200)
            })
        })
    })
})