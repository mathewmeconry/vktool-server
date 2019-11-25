import * as Express from 'express'
import TestHelper from '../helpers/TestHelper';
import supertest = require('supertest');
import { expect } from 'chai';

describe('CliController', function () {
    this.timeout(5000)
    let app: Express.Application;

    before(() => {
        app = TestHelper.app
    })

    it('should return the frontend', async () => {
        return supertest(app)
            .get('/webapp/')
            .expect(200)
            .then(res => {
                expect(res.text).to.include('<!doctype html><html')
            })
    })
})
