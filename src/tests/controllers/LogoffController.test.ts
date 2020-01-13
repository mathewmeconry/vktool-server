import { expect } from "chai"
import * as Express from 'express'
import supertest = require("supertest")
import TestHelper from "../helpers/TestHelper"
import Logoff from "../../entities/Logoff"

describe('Logoff Controller', () => {
    let app: Express.Application
    let logoff: Logoff
    let logoffAddPayload: { contact: number, from: string, until: string }
    let logoffBulkPayload: { contact: number, logoffs: Array<{ from: string, until: string, remarks?: string }> }

    before(() => {
        app = TestHelper.app

        logoffAddPayload = {
            contact: TestHelper.mockContact.id,
            from: '2020-01-01T09:30:00.000Z',
            until: '2020-01-08T09:30:00.000Z',
        }

        logoffBulkPayload = {
            contact: TestHelper.mockContact2.id,
            logoffs: [
                {
                    from: '2020-01-01T09:30:00.000Z',
                    until: '2020-01-08T09:30:00.000Z',
                },
                {
                    from: '2020-01-10T09:30:00.000Z',
                    until: '2020-01-12T09:30:00.000Z',
                    remarks: 'There is one'
                }
            ]
        }

    })

    describe('add', () => {
        it('should add an approved logoff', async () => {
            return supertest(app)
                .put('/api/logoffs/add')
                .set('Cookie', TestHelper.authenticatedAdminCookies)
                .send(logoffAddPayload)
                .expect(200)
                .then(res => {
                    expect(res.body.contact.id).to.be.eq(logoffAddPayload.contact)
                    expect(res.body.from).to.be.eq(logoffAddPayload.from)
                    expect(res.body.until).to.be.eq(logoffAddPayload.until)
                    expect(res.body.remarks).to.be.null
                    expect(res.body.approved).to.be.eq(true)
                    logoff = res.body
                })
        })

        it('should add an non approved logoff', async () => {
            return supertest(app)
                .put('/api/logoffs/add?bypass=true')
                .set('Cookie', TestHelper.authenticatedNonAdminCookies)
                .send(logoffAddPayload)
                .expect(200)
                .then(res => {
                    expect(res.body.contact.id).to.be.eq(logoffAddPayload.contact)
                    expect(res.body.from).to.be.eq(logoffAddPayload.from)
                    expect(res.body.until).to.be.eq(logoffAddPayload.until)
                    expect(res.body.remarks).to.be.null
                    expect(res.body.approved).to.be.eq(false)
                    logoff = res.body
                })
        })

        it('should return 500 with no contact', async () => {
            return supertest(app)
                .put('/api/logoffs/add')
                .set('Cookie', TestHelper.authenticatedAdminCookies)
                .send({ ...logoffAddPayload, contact: undefined })
                .expect(500)
        })


        it('should return 500 with no from', async () => {
            return supertest(app)
                .put('/api/logoffs/add')
                .set('Cookie', TestHelper.authenticatedAdminCookies)
                .send({ ...logoffAddPayload, from: undefined })
                .expect(500)
        })

        it('should return 500 with no until', async () => {
            return supertest(app)
                .put('/api/logoffs/add')
                .set('Cookie', TestHelper.authenticatedAdminCookies)
                .send({ ...logoffAddPayload, until: undefined })
                .expect(500)
        })
    })

    describe('add bulk', () => {
        it('should add some logoffs', async () => {
            return supertest(app)
                .put('/api/logoffs/add/bulk')
                .set('Cookie', TestHelper.authenticatedAdminCookies)
                .send(logoffBulkPayload)
                .expect(200)
                .then(res => {
                    expect(res.body.length).to.be.eq(logoffBulkPayload.logoffs.length)
                    expect(res.body[0].contact.id).to.be.eq(logoffBulkPayload.contact)
                    expect(res.body[0].remarks).to.be.null
                    expect(res.body[0].approved).to.be.eq(true)
                    expect(res.body[1].remarks).to.be.eq('There is one')
                    expect(res.body[1].approved).to.be.eq(true)
                })
        })

        it('should return 500 with no contact', async () => {
            return supertest(app)
                .put('/api/logoffs/add')
                .set('Cookie', TestHelper.authenticatedAdminCookies)
                .send({ ...logoffBulkPayload, contact: undefined })
                .expect(500)
        })


        it('should return 500 with no from', async () => {
            return supertest(app)
                .put('/api/logoffs/add')
                .set('Cookie', TestHelper.authenticatedAdminCookies)
                .send({ ...logoffBulkPayload, logoffs: [{ until: logoffBulkPayload.logoffs[0].until }] })
                .expect(500)
        })

        it('should return 500 with no until', async () => {
            return supertest(app)
                .put('/api/logoffs/add')
                .set('Cookie', TestHelper.authenticatedAdminCookies)
                .send({ ...logoffBulkPayload, logoffs: [{ from: logoffBulkPayload.logoffs[0].from }] })
                .expect(500)
        })
    })

    describe('getAll', () => {
        it('should return all logoffs', async () => {
            return supertest(app)
                .get('/api/logoffs')
                .set('Cookie', TestHelper.authenticatedAdminCookies)
                .send(logoffBulkPayload)
                .expect(200)
                .then(res => {
                    expect(res.body.length).to.be.greaterThan(logoffBulkPayload.logoffs.length)
                })
        })
    })

    describe('delete', () => {
        it('should softdelete in URL', async () => {
            return supertest(app)
                .delete(`/api/logoffs/${logoff.id}`)
                .set('Cookie', TestHelper.authenticatedAdminCookies)
                .expect(200)
                .then(res => {
                    expect(res.body.deletedAt).not.to.be.eq(undefined)
                    expect(res.body.deletedBy.id).to.be.eq(TestHelper.mockAdminUser.id)
                })
        })

        it('should softdelete in query params', async () => {
            return supertest(app)
                .delete(`/api/logoffs?logoff=${logoff.id}`)
                .set('Cookie', TestHelper.authenticatedAdminCookies)
                .expect(200)
                .then(res => {
                    expect(res.body.deletedAt).not.to.be.eq(undefined)
                    expect(res.body.deletedBy.id).to.be.eq(TestHelper.mockAdminUser.id)
                })
        })

        it('should fail with 500', async () => {
            return supertest(app)
                .delete(`/api/logoffs`)
                .set('Cookie', TestHelper.authenticatedAdminCookies)
                .expect(500)
        })
    })
})