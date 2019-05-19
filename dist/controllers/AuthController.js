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
const passport_1 = __importDefault(require("passport"));
const AuthService_1 = __importDefault(require("../services/AuthService"));
const config_1 = __importDefault(require("config"));
class AuthController {
    static isAuth(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.send({
                authenticated: AuthService_1.default.isAuthenticated(req, res)
            });
        });
    }
    static authAzure(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            passport_1.default.authenticate('azure_ad_oauth2')(req, res, next);
        });
    }
    static callbackAzure(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            passport_1.default.authenticate('azure_ad_oauth2', { failureRedirect: '/login' })(req, res, () => {
                res.redirect(config_1.default.get('clientHost'));
            });
        });
    }
    static logout(req, res) {
        req.logout();
        res.redirect(config_1.default.get('clientHost') + '/login');
    }
}
exports.default = AuthController;
//# sourceMappingURL=AuthController.js.map