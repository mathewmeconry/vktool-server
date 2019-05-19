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
const AuthService_1 = __importDefault(require("../../services/AuthService"));
const AuthRoles_1 = require("../../interfaces/AuthRoles");
const chai_1 = require("chai");
const supertest = require("supertest");
const TestHelper_1 = __importDefault(require("../helpers/TestHelper"));
describe('AuthService', () => {
    let app;
    before(() => {
        app = TestHelper_1.default.app;
    });
    it('should allow everything to admin', () => {
        chai_1.expect(AuthService_1.default.isAuthorized([AuthRoles_1.AuthRoles.ADMIN], AuthRoles_1.AuthRoles.BILLINGREPORTS_CREATE)).to.be.true;
    });
    it('should block if no access', () => {
        chai_1.expect(AuthService_1.default.isAuthorized([AuthRoles_1.AuthRoles.MEMBERS_READ], AuthRoles_1.AuthRoles.MEMBERS_EDIT)).to.be.false;
    });
    it('should allow', () => {
        chai_1.expect(AuthService_1.default.isAuthorized([AuthRoles_1.AuthRoles.MEMBERS_EDIT], AuthRoles_1.AuthRoles.MEMBERS_EDIT)).to.be.true;
    });
    describe('AuthService middleware', () => {
        it('should return 403', () => __awaiter(this, void 0, void 0, function* () {
            return supertest(app)
                .get('/check/authservice')
                .set('Cookie', TestHelper_1.default.authenticatedNonAdminCookies)
                .expect(403)
                .then(res => {
                chai_1.expect(res.body.error).to.be.equal('Forbidden');
            });
        }));
        it('should return 401', () => __awaiter(this, void 0, void 0, function* () {
            return supertest(app)
                .get('/check/authservice')
                .expect(401)
                .then(res => {
                chai_1.expect(res.body.error).to.be.equal('Not authorized');
            });
        }));
        it('should call next', () => {
            return supertest(app)
                .get('/check/authservice')
                .set('Cookie', TestHelper_1.default.authenticatedAdminCookies)
                .expect(200);
        });
    });
});
//# sourceMappingURL=AuthService.js.map