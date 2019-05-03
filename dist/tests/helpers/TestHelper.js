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
const CliController_1 = __importDefault(require("../../controllers/CliController"));
const supertest = require("supertest");
const typeorm_1 = require("typeorm");
const GenMockData_1 = require("./GenMockData");
before(() => __awaiter(this, void 0, void 0, function* () {
    return TestHelper.init();
}));
class TestHelper {
    static init() {
        return __awaiter(this, void 0, void 0, function* () {
            let { app } = yield CliController_1.default.startServer();
            TestHelper.app = app;
            // @ts-ignore
            yield typeorm_1.createConnection();
            TestHelper.mockUser = yield GenMockData_1.genMockUser();
            TestHelper.mockGroup = yield GenMockData_1.genMockContactGroup();
            TestHelper.mockMemberGroup = yield GenMockData_1.genMockContactGroup(7);
            TestHelper.mockType = yield GenMockData_1.genMockContactType();
            TestHelper.mockContact = yield GenMockData_1.genMockContact(TestHelper.mockType, [TestHelper.mockGroup, TestHelper.mockMemberGroup]);
            TestHelper.mockContact2 = yield GenMockData_1.genMockContact(TestHelper.mockType, [TestHelper.mockGroup, TestHelper.mockMemberGroup]);
            TestHelper.mockOrder = yield GenMockData_1.genOrders(TestHelper.mockContact);
            return supertest(TestHelper.app)
                .get('/api/auth/mock')
                .expect(200)
                .then(res => {
                TestHelper.authenticatedCookies = res.get('Set-Cookie');
            });
        });
    }
}
exports.default = TestHelper;
//# sourceMappingURL=TestHelper.js.map