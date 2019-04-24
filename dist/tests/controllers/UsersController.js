"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TestHelper_1 = __importDefault(require("../helpers/TestHelper"));
const supertest = require("supertest");
const chai_1 = require("chai");
const AuthRoles_1 = require("../../interfaces/AuthRoles");
describe('UsersController', function () {
    this.timeout(5000);
    let app;
    before(() => {
        app = TestHelper_1.default.app;
    });
    it('get me', () => __awaiter(this, void 0, void 0, function* () {
        return supertest(app)
            .get('/api/me')
            .set('Cookie', TestHelper_1.default.authenticatedCookies)
            .expect(200)
            .then(res => {
            let record = res.body;
            chai_1.expect(record).to.has.ownProperty('displayName');
            chai_1.expect(record).to.has.ownProperty('roles');
            chai_1.expect(record).to.has.ownProperty('provider');
            chai_1.expect(record.roles.length).to.be.greaterThan(0);
            chai_1.expect(record.roles).include(AuthRoles_1.AuthRoles.ADMIN);
            chai_1.expect(record.provider).to.be.equal('mock');
        });
    }));
});
//# sourceMappingURL=UsersController.js.map