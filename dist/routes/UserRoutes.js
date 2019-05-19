"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuthService_1 = __importDefault(require("../services/AuthService"));
const UserController_1 = __importDefault(require("../controllers/UserController"));
const AuthRoles_1 = require("../interfaces/AuthRoles");
function UserRoutes(app) {
    app.get('/api/me', UserController_1.default.me);
    app.get('/api/users', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.ADMIN]), UserController_1.default.users);
}
exports.default = UserRoutes;
//# sourceMappingURL=UserRoutes.js.map