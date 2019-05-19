"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuthController_1 = __importDefault(require("../controllers/AuthController"));
const passport = require("passport");
const AuthRoles_1 = require("../interfaces/AuthRoles");
const AuthService_1 = __importDefault(require("../services/AuthService"));
function AuthRoutes(app) {
    app.get('/api/isauth', AuthController_1.default.isAuth);
    app.get('/api/auth/azure', AuthController_1.default.authAzure);
    app.get('/api/auth/azure/callback', AuthController_1.default.callbackAzure);
    app.get('/api/logout', AuthController_1.default.logout);
    // route for mocked login 
    if (process.env.TESTING)
        app.get('/api/auth/mock-admin', passport.authenticate('mock-admin'));
    if (process.env.TESTING)
        app.get('/api/auth/mock', passport.authenticate('mock-nonadmin'));
    if (process.env.TESTING)
        app.get('/check/authservice', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.MEMBERS_READ]), (req, res) => { res.status(200); res.send(''); });
}
exports.default = AuthRoutes;
//# sourceMappingURL=AuthRoutes.js.map