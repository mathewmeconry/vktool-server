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
    app.put('/api/compensations', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.COMPENSATIONS_CREATE]), CompensationController_1.default.add);
    app.post('/api/compensations/approve', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.COMPENSATIONS_APPROVE]), CompensationController_1.default.approve);
}
exports.default = CompensationRoutes;
//# sourceMappingURL=CompensationRoutes.js.map