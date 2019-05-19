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
const AuthService_1 = __importDefault(require("../services/AuthService"));
const User_1 = __importDefault(require("../entities/User"));
const typeorm_1 = require("typeorm");
class UserController {
    static me(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (AuthService_1.default.isAuthenticated(req, res)) {
                res.send(req.user);
            }
            else {
                res.send({});
            }
        });
    }
    static users(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.send(yield typeorm_1.getManager().getRepository(User_1.default).find());
        });
    }
}
exports.default = UserController;
//# sourceMappingURL=UserController.js.map