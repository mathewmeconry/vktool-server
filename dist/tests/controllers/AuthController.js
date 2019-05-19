"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const config = require("config");
const supertest = require("supertest");
const TestHelper_1 = __importDefault(require("../helpers/TestHelper"));
describe('AuthController', () => {
    let app;
    before(() => {
        app = TestHelper_1.default.app;
    });
    describe('isAuth', () => {
        it('should return true', () => {
            return supertest(app)
                .get('/api/isauth')
                .set('Cookie', TestHelper_1.default.authenticatedAdminCookies)
                .expect(200)
                .then(response => {
                chai_1.expect(response.body).to.has.ownProperty('authenticated');
                chai_1.expect(response.body.authenticated).to.be.true;
            });
        });
        it('should return false', () => {
            return supertest(app)
                .get('/api/isauth')
                .expect(200)
                .then(response => {
                chai_1.expect(response.body).to.has.ownProperty('authenticated');
                chai_1.expect(response.body.authenticated).to.be.false;
            });
        });
    });
    describe('logout', () => {
        it('should redirect me to login', () => {
            return supertest(app)
                .get('/api/logout')
                .expect(302)
                .then(response => {
                chai_1.expect(response.header).to.has.ownProperty('location');
                chai_1.expect(response.header.location).to.include(config.get('clientHost') + '/login');
            });
        });
    });
    describe('azure AAD / office365', () => {
        describe('auth', () => {
            it('should send me to microsoft', () => {
                return supertest(app)
                    .get('/api/auth/azure')
                    .expect(302)
                    .then(response => {
                    chai_1.expect(response.header).to.has.ownProperty('location');
                    chai_1.expect(response.header.location).to.include('https://login.windows.net/vkazu.ch/oauth2/authorize?resource=2209da49-23d9-4365-95d1-fa2dc84c7a8f');
                });
            });
        });
    });
});
//# sourceMappingURL=AuthController.js.map