"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BillingReportController_1 = __importDefault(require("../controllers/BillingReportController"));
const AuthService_1 = __importDefault(require("../services/AuthService"));
const AuthRoles_1 = require("../interfaces/AuthRoles");
function BillingReportRoutes(app) {
    app.get('/api/billing-reports', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.BILLINGREPORTS_READ, AuthRoles_1.AuthRoles.BILLINGREPORTS_CREATE]), BillingReportController_1.default.getBillingReports);
    app.get('/api/billing-reports/open', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.BILLINGREPORTS_CREATE, AuthRoles_1.AuthRoles.BILLINGREPORTS_EDIT]), BillingReportController_1.default.getOpenOrders);
    app.post('/api/billing-reports/approve', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.BILLINGREPORTS_APPROVE]), BillingReportController_1.default.approveDecline);
    app.post('/api/billing-reports/decline', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.BILLINGREPORTS_APPROVE]), BillingReportController_1.default.approveDecline);
    app.post('/api/billing-reports', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.BILLINGREPORTS_EDIT, AuthRoles_1.AuthRoles.BILLINGREPORTS_CREATE]), BillingReportController_1.default.edit);
    app.put('/api/billing-reports', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.BILLINGREPORTS_CREATE]), BillingReportController_1.default.put);
}
exports.default = BillingReportRoutes;
//# sourceMappingURL=BillingReportRoutes.js.map