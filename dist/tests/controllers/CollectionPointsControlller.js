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
describe('CollectionPointsController', function () {
    this.timeout(5000);
    let app;
    let dbRecord;
    let collectionPoint = {
        address: 'Neuenhoferstrasse 101',
        city: 'Baden',
        name: 'Best Place ever',
        postcode: '5400'
    };
    before(() => {
        app = TestHelper_1.default.app;
    });
    it('should add a new collection point', () => __awaiter(this, void 0, void 0, function* () {
        return supertest(app)
            .put('/api/collection-points')
            .set('Cookie', TestHelper_1.default.authenticatedAdminCookies)
            .expect(200)
            .send(collectionPoint)
            .then((res) => {
            dbRecord = res.body;
            chai_1.expect(dbRecord.address).to.be.equal(collectionPoint.address);
            chai_1.expect(dbRecord.city).to.be.equal(collectionPoint.city);
            chai_1.expect(dbRecord.name).to.be.equal(collectionPoint.name);
            chai_1.expect(dbRecord.postcode).to.be.equal(collectionPoint.postcode);
        });
    }));
    it('should return all collection points', () => __awaiter(this, void 0, void 0, function* () {
        return supertest(app)
            .get('/api/collection-points')
            .set('Cookie', TestHelper_1.default.authenticatedAdminCookies)
            .expect(200)
            .then((res) => {
            let rec = res.body[res.body.length - 1];
            chai_1.expect(rec.id).to.be.equal(dbRecord.id);
            chai_1.expect(rec.address).to.be.equal(dbRecord.address);
            chai_1.expect(rec.city).to.be.equal(dbRecord.city);
            chai_1.expect(rec.name).to.be.equal(dbRecord.name);
            chai_1.expect(rec.postcode).to.be.equal(dbRecord.postcode);
        });
    }));
});
//# sourceMappingURL=CollectionPointsControlller.js.map