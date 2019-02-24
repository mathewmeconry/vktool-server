"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuthController_1 = __importDefault(require("../controllers/AuthController"));
function AuthRoutes(app) {
    app.get('/api/isauth', AuthController_1.default.isAuth);
    app.get('/api/auth/outlook', AuthController_1.default.auth);
    app.get('/api/auth/outlook/callback', AuthController_1.default.callback);
    app.get('/api/logout', AuthController_1.default.logout);
}
exports.default = AuthRoutes;
//# sourceMappingURL=AuthRoutes.js.map