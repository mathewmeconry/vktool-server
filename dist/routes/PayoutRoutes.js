"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuthService_1 = __importDefault(require("../services/AuthService"));
const AuthRoles_1 = require("../interfaces/AuthRoles");
const PayoutController_1 = __importDefault(require("../controllers/PayoutController"));
function PayoutRoutes(app) {
    app.get('/api/payouts', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.PAYOUTS_READ]), PayoutController_1.default.getPayouts);
    app.get('/api/payouts/:payout/pdf', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.PAYOUTS_READ]), PayoutController_1.default.generatePayoutPDF);
    app.get('/api/payouts/:payout/:member/pdf', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.PAYOUTS_READ]), PayoutController_1.default.generateMemberPDF);
    app.put('/api/payouts', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.PAYOUTS_CREATE]), PayoutController_1.default.createPayout);
    app.post('/api/payouts/reclaim', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.PAYOUTS_CREATE]), PayoutController_1.default.reclaim);
    app.post('/api/payouts/member/pdf', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.PAYOUTS_READ]), PayoutController_1.default.generateMemberPDF);
    app.post('/api/payouts/member/html', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.PAYOUTS_READ]), PayoutController_1.default.generateMemberHTML);
    app.post('/api/payouts/email', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.PAYOUTS_SEND]), PayoutController_1.default.sendMails);
}
exports.default = PayoutRoutes;
//# sourceMappingURL=PayoutRoutes.js.map