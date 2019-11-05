import * as Express from 'express'
import TestHelper from '../helpers/TestHelper';
import supertest = require('supertest');
import { expect } from 'chai';
import Order from '../../entities/Order';


describe('OrdersController', function () {
    this.timeout(5000)
    let app: Express.Application;

    before(() => {
        app = TestHelper.app
    })

    it('should get all orders', async () => {
        return supertest(app)
            .get('/api/orders')
            .set('Cookie', TestHelper.authenticatedNonAdminCookies)
            .expect(200)
            .then(res => {
                expect(res.body.length).to.be.greaterThan(0)
                let dbRecord: Order = res.body[0]
                expect(dbRecord).to.have.ownProperty('documentNr')
                expect(dbRecord).to.have.ownProperty('title')
                expect(dbRecord).to.have.ownProperty('positions')
                expect(dbRecord).to.have.ownProperty('execDates')
                expect(dbRecord.execDates.length).to.be.greaterThan(0)
            })
    })
})
