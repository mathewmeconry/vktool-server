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
describe('OrdersController', function () {
    this.timeout(5000);
    let app;
    before(() => {
        app = TestHelper_1.default.app;
    });
    it('get Orders', () => __awaiter(this, void 0, void 0, function* () {
        return supertest(app)
            .get('/api/orders')
            .set('Cookie', TestHelper_1.default.authenticatedCookies)
            .expect(200)
            .then(res => {
            chai_1.expect(res.body.length).to.be.greaterThan(0);
            let dbRecord = res.body[0];
            chai_1.expect(dbRecord).to.have.ownProperty('documentNr');
            chai_1.expect(dbRecord).to.have.ownProperty('title');
            chai_1.expect(dbRecord).to.have.ownProperty('positions');
            chai_1.expect(dbRecord).to.have.ownProperty('execDates');
            chai_1.expect(dbRecord.execDates.length).to.be.greaterThan(0);
        });
    }));
});
//# sourceMappingURL=OrdersController.js.map