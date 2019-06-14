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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuthRoles_1 = require("../interfaces/AuthRoles");
const passport_1 = __importDefault(require("passport"));
//@ts-ignore
const User_1 = __importDefault(require("../entities/User"));
const Contact_1 = __importDefault(require("../entities/Contact"));
const config_1 = __importDefault(require("config"));
const typeorm_1 = require("typeorm");
const passport_mock_strategy_1 = require("passport-mock-strategy");
const jwt = __importStar(require("jsonwebtoken"));
const AzureAdOAuth2Strategy = require("passport-azure-ad-oauth2");
class AuthService {
    static init(app) {
        passport_1.default.serializeUser(AuthService.serializeUser);
        passport_1.default.deserializeUser(AuthService.deserializeUser);
        AuthService.addAzureStrategy();
        let mockUser = {
            id: 'mock-1',
            name: {
                givenName: 'mock',
                familyName: 'mocking'
            },
            displayName: 'mock',
            provider: 'mock-admin', emails: [{
                    value: 'fakemail@mail.com',
                    type: 'mocked'
                }]
        };
        if (process.env.TESTING)
            passport_1.default.use(new passport_mock_strategy_1.MockStrategy({ name: 'mock-admin', user: Object.assign({}, mockUser, { id: 'mock-admin' }) }));
        if (process.env.TESTING)
            passport_1.default.use(new passport_mock_strategy_1.MockStrategy({ name: 'mock-nonadmin', user: Object.assign({}, mockUser, { id: 'mock-nonadmin', provider: 'mock-nonadmin' }) }));
        app.use(passport_1.default.initialize());
        app.use(passport_1.default.session());
    }
    static checkAuthorization(roles) {
        return function (req, res, next) {
            if (req.isAuthenticated()) {
                for (let role of roles) {
                    if (AuthService.isAuthorized(req.user.roles, role)) {
                        next();
                        return;
                    }
                }
                res.status(403);
                res.send({
                    error: 'Forbidden'
                });
                res.end();
            }
            else {
                res.status(401);
                res.send({
                    error: 'Not authorized'
                });
                res.end();
            }
        };
    }
    static isAuthorized(roles, role) {
        if (roles.indexOf(role) > -1 || roles.indexOf(AuthRoles_1.AuthRoles.ADMIN) > -1) {
            return true;
        }
        return false;
    }
    static isAuthenticated(req, res) {
        return req.isAuthenticated();
    }
    static serializeUser(user, done) {
        done(null, `${user.provider}-${user.id.toString()}`);
    }
    static deserializeUser(id, done) {
        if (id.split('-')[0] === 'mock') {
            let user = new User_1.default();
            user.id = 1;
            user.displayName = 'Mock User';
            user.roles = (id.split('-')[1] === 'admin') ? [AuthRoles_1.AuthRoles.ADMIN] : [AuthRoles_1.AuthRoles.AUTHENTICATED];
            user.provider = 'mock';
            user.lastLogin = new Date();
            done(null, user);
            return;
        }
        typeorm_1.getManager().getRepository(User_1.default).find({ id: parseInt(id.split('-')[1]) })
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
    static addAzureStrategy() {
        passport_1.default.use(new AzureAdOAuth2Strategy({
            clientID: config_1.default.get('azure.clientID'),
            clientSecret: config_1.default.get('azure.clientSecret'),
            callbackURL: config_1.default.get('apiEndpoint') + '/api/auth/azure/callback',
            resource: config_1.default.get('azure.resource'),
            tenant: config_1.default.get('azure.tenant')
        }, (accessToken, refreshToken, params, profile, done) => __awaiter(this, void 0, void 0, function* () {
            const azureProfile = jwt.decode(params.id_token);
            const outlookMultitendandId = `${azureProfile.oid}@${azureProfile.tid}`;
            let user = yield AuthService.findUserByOutlookId(outlookMultitendandId);
            if (user) {
                user.accessToken = accessToken;
                user.refreshToken = refreshToken;
                user.displayName = profile.displayName;
                user.lastLogin = new Date();
                return done(null, yield user.save());
            }
            else {
                let userInfo = {};
                typeorm_1.getManager().getRepository(Contact_1.default).findOne({ mail: azureProfile.upn }).then(contact => {
                    userInfo = {
                        outlookId: outlookMultitendandId,
                        accessToken: accessToken,
                        refreshToken: '',
                        displayName: azureProfile.name,
                        roles: [AuthRoles_1.AuthRoles.AUTHENTICATED],
                        bexioContact: contact || undefined,
                        provider: 'azure'
                    };
                }).catch(() => {
                    userInfo = {
                        outlookId: outlookMultitendandId,
                        accessToken: accessToken,
                        refreshToken: '',
                        displayName: azureProfile.name,
                        roles: [AuthRoles_1.AuthRoles.AUTHENTICATED],
                        provider: 'azure'
                    };
                }).then(() => __awaiter(this, void 0, void 0, function* () {
                    //@ts-ignore
                    if (refreshToken)
                        userInfo.refreshToken = refreshToken;
                    //@ts-ignore
                    user = yield AuthService.findUserByOutlookId(outlookMultitendandId);
                    if (!user)
                        user = new User_1.default();
                    user = Object.assign(user, userInfo);
                    user.lastLogin = new Date();
                    user.save().then(user => {
                        return done(null, user);
                    }).catch((err) => {
                        return done(err);
                    });
                }));
            }
        })));
    }
}
exports.default = AuthService;
//# sourceMappingURL=AuthService.js.map