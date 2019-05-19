"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuthRoles_1 = require("../interfaces/AuthRoles");
const CompensationController_1 = __importDefault(require("../controllers/CompensationController"));
const AuthService_1 = __importDefault(require("../services/AuthService"));
function CompensationRoutes(app) {
    app.get('/api/compensations', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.COMPENSATIONS_READ]), CompensationController_1.default.getAll);
    app.get('/api/compensations/:member', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.COMPENSATIONS_READ]), CompensationController_1.default.getUser);
    app.put('/api/compensations', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.COMPENSATIONS_CREATE, AuthRoles_1.AuthRoles.BILLINGREPORTS_EDIT, AuthRoles_1.AuthRoles.BILLINGREPORTS_CREATE]), CompensationController_1.default.add);
    app.put('/api/compensations/bulk', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.COMPENSATIONS_CREATE, AuthRoles_1.AuthRoles.BILLINGREPORTS_EDIT, AuthRoles_1.AuthRoles.BILLINGREPORTS_CREATE]), CompensationController_1.default.addBulk);
    app.post('/api/compensations/approve', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.COMPENSATIONS_APPROVE]), CompensationController_1.default.approve);
    app.delete('/api/compensations', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.COMPENSATIONS_EDIT]), CompensationController_1.default.delete);
}
exports.default = CompensationRoutes;
//# sourceMappingURL=CompensationRoutes.js.map