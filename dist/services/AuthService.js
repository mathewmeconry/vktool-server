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
const AuthRoles_1 = require("../interfaces/AuthRoles");
const passport_1 = __importDefault(require("passport"));
//@ts-ignore
const passport_outlook_1 = require("passport-outlook");
const User_1 = __importDefault(require("../entities/User"));
const Contact_1 = __importDefault(require("../entities/Contact"));
const config_1 = __importDefault(require("config"));
const typeorm_1 = require("typeorm");
class AuthService {
    static init(app) {
        passport_1.default.serializeUser(AuthService.serializeUser);
        passport_1.default.deserializeUser(AuthService.deserializeUser);
        AuthService.addOutlookStrategy();
        app.use(passport_1.default.initialize());
        app.use(passport_1.default.session());
    }
    static checkAuthorization(role) {
        return function (req, res, next) {
            if (AuthService.isAuthorized(req, role)) {
                next();
            }
            else {
                res.status(401);
                res.send({
                    error: 'Not authorized'
                });
            }
        };
    }
    static isAuthorized(req, role) {
        if (req.isAuthenticated() && (req.user.roles.indexOf(role) > -1 || req.user.roles.indexOf(AuthRoles_1.AuthRoles.ADMIN) > -1)) {
            return true;
        }
        return false;
    }
    static isAuthenticated(req, res) {
        return req.isAuthenticated();
    }
    static serializeUser(user, done) {
        done(null, user.id.toString());
    }
    static deserializeUser(id, done) {
        typeorm_1.getManager().getRepository(User_1.default).find({ id: parseInt(id) })
            .then(user => {
            if (user && user.length === 1) {
                done(null, user[0]);
            }
            else {
                done('no User found');
            }
        }).catch(err => {
            done(err);
        });
    }
    static findUserByOutlookId(outlookId) {
        return __awaiter(this, void 0, void 0, function* () {
            return typeorm_1.getManager().getRepository(User_1.default).findOne({ outlookId: outlookId });
        });
    }
    static addOutlookStrategy() {
        passport_1.default.use(new passport_outlook_1.Strategy({
            clientID: "2209da49-23d9-4365-95d1-fa2dc84c7a8f",
            clientSecret: "yOB%SiU-yed3V18EL:Z7",
            callbackURL: config_1.default.get('apiEndpoint') + '/api/auth/outlook/callback'
        }, function (accessToken, refreshToken, profile, done) {
            return __awaiter(this, void 0, void 0, function* () {
                let matched = false;
                for (let email of profile.emails) {
                    if (email.value.match(/@vkazu\.ch$/))
                        matched = true;
                }
                if (!matched) {
                    return done(new Error('No accepted Organization'));
                }
                let user = yield AuthService.findUserByOutlookId(profile.id);
                console.log(user);
                if (user) {
                    user.accessToken = accessToken,
                        user.refreshToken = refreshToken;
                    user.displayName = profile.displayName;
                    yield typeorm_1.getManager().getRepository(User_1.default).save(user);
                    return done(null, user);
                }
                else {
                    console.log('else');
                    let userInfo = {};
                    typeorm_1.getManager().getRepository(Contact_1.default).findOne({ mail: profile.emails[0].value }).then(contact => {
                        userInfo = {
                            outlookId: profile.id,
                            accessToken: accessToken,
                            refreshToken: '',
                            displayName: profile.displayName,
                            roles: [AuthRoles_1.AuthRoles.MEMBERS_READ, AuthRoles_1.AuthRoles.AUTHENTICATED, AuthRoles_1.AuthRoles.ADMIN],
                            bexioContact: contact || undefined
                        };
                    }).catch(() => {
                        userInfo = {
                            outlookId: profile.id,
                            accessToken: accessToken,
                            displayName: profile.displayName,
                            roles: [AuthRoles_1.AuthRoles.MEMBERS_READ, AuthRoles_1.AuthRoles.AUTHENTICATED, AuthRoles_1.AuthRoles.ADMIN],
                            refreshToken: ''
                        };
                    }).then(() => __awaiter(this, void 0, void 0, function* () {
                        //@ts-ignore
                        if (refreshToken)
                            userInfo.refreshToken = refreshToken;
                        let UserRepo = typeorm_1.getManager().getRepository(User_1.default);
                        //@ts-ignore
                        user = yield UserRepo.findOne({ outlookId: userInfo.outlookId });
                        if (!user)
                            user = new User_1.default();
                        user = Object.assign(user, userInfo);
                        typeorm_1.getManager().getRepository(User_1.default).save(user).then(user => {
                            console.log(user);
                            return done(null, user);
                        }).catch(err => {
                            console.log(err);
                            return done(err);
                        });
                    }));
                }
            });
        }));
    }
}
exports.default = AuthService;
//# sourceMappingURL=AuthService.js.map