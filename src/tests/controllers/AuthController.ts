import { expect } from "chai";
import config = require("config");
import * as Express from 'express'
import supertest = require("supertest");
import TestHelper from "../helpers/TestHelper";

describe('AuthRoutes', () => {
    let app: Express.Application;

    before(() => {
        app = TestHelper.app
    })

    describe('isAuth', () => {
        it('should return true', () => {
            return supertest(app)
                .get('/api/isauth')
                .set('Cookie', TestHelper.authenticatedCookies)
                .expect(200)
                .then(response => {
                    expect(response.body).to.has.ownProperty('authenticated')
                    expect(response.body.authenticated).to.be.true
                })
        })

        it('should return false', () => {
            return supertest(app)
                .get('/api/isauth')
                .expect(200)
                .then(response => {
                    expect(response.body).to.has.ownProperty('authenticated')
                    expect(response.body.authenticated).to.be.false
                })
        })
    })

    describe('logout', () => {
        it('should redirect me to login', () => {
            return supertest(app)
                .get('/api/logout')
                .expect(302)
                .then(response => {
                    expect(response.header).to.has.ownProperty('location')
                    expect(response.header.location).to.include(config.get('clientHost') + '/login')
                })
        })
    })

    describe('outlook / office365', () => {
        describe('auth', () => {
            it('should send me to microsoft', () => {
                return supertest(app)
                    .get('/api/auth/outlook')
                    .expect(302)
                    .then(response => {
                        expect(response.header).to.has.ownProperty('location')
                        expect(response.header.location).to.include('https://login.microsoftonline.com/common/oauth2/v2.0/authorize?')
                    })
            })
        })
    })
})