import { AuthRoles, AuthRolesByRank } from "../interfaces/AuthRoles";
import passport from 'passport'
import * as Express from 'express'
//@ts-ignore
import User from '../entities/User';
import Contact from '../entities/Contact';
import config from 'config'
import { getManager } from "typeorm";
import { MockStrategy } from "passport-mock-strategy";
import * as jwt from 'jsonwebtoken'
import mockUser from "passport-mock-strategy/lib/mock-user";
import AzureAdOAuth2Strategy = require('passport-azure-ad-oauth2')

export default class AuthService {
    public static init(app: Express.Application) {
        passport.serializeUser(AuthService.serializeUser);
        passport.deserializeUser(AuthService.deserializeUser);

        AuthService.addAzureStrategy()

        let mockUser: mockUser.User = {
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
        }
        if (process.env.TESTING) passport.use(new MockStrategy({ name: 'mock-admin', user: Object.assign({}, mockUser, { id: `mock-admin-${Math.round(Math.random() * 10) + 1}` }) }));
        if (process.env.TESTING) passport.use(new MockStrategy({ name: 'mock-nonadmin', user: Object.assign({}, mockUser, { id: `mock-nonadmin-${Math.round(Math.random() * 10) + 1}`, provider: 'mock-nonadmin' }) }));

        app.use(passport.initialize())
        app.use(passport.session())
    }

    public static checkAuthorization(roles: Array<AuthRoles>): (req: Express.Request, res: Express.Response, next: Express.NextFunction) => void {
        return function (req, res, next) {
            if (req.isAuthenticated()) {
                if (req.user.provider === 'mock' && req.query.bypass !== 'false') {
                    next()
                    return
                }

                for (let role of roles) {
                    if (AuthService.isAuthorized(req.user.roles, role)) {
                        next()
                        return
                    }
                }

                res.status(403)
                res.send({
                    error: 'Forbidden'
                })
                res.end()
            } else {
                res.status(401)
                res.send({
                    error: 'Not authorized'
                })
                res.end()
            }
        }
    }

    public static isAuthorized(roles: Array<AuthRoles>, role: AuthRoles): boolean {
        if (roles.indexOf(role) > -1 || roles.indexOf(AuthRoles.ADMIN) > -1) {
            return true
        }

        return false
    }

    public static isAuthenticated(req: Express.Request, res: Express.Response): boolean {
        return req.isAuthenticated()
    }

    public static serializeUser(user: User, done: (err: any, userId?: string) => void): void {
        done(null, `${user.provider}-${user.id.toString()}`);
    }

    public static deserializeUser(id: string, done: (err: any, user?: User) => void): void {
        const splittedId = id.split('-')
        if (splittedId[0] === 'mock') {
            let user = new User()
            user.id = parseInt(splittedId[splittedId.length - 1])
            user.displayName = 'Mock User'
            user.roles = (splittedId[1] === 'admin') ? [AuthRoles.ADMIN] : [AuthRoles.AUTHENTICATED]
            user.provider = 'mock'
            user.lastLogin = new Date()
            done(null, user)
            return
        }

        getManager().getRepository(User).find({ id: parseInt(id.split('-')[1]) })
            .then(user => {
                if (user && user.length === 1) {
                    done(null, user[0])
                } else {
                    done('no User found')
                }
            }).catch(err => {
                done(err)
            })
    }


    private static async findUserByOutlookId(outlookId: string): Promise<User | undefined> {
        return getManager().getRepository(User).findOne({ outlookId: outlookId })
    }

    private static addAzureStrategy() {
        passport.use(new AzureAdOAuth2Strategy({
            clientID: config.get('azure.clientID'),
            clientSecret: config.get('azure.clientSecret'),
            callbackURL: config.get('apiEndpoint') + '/api/auth/azure/callback',
            resource: config.get('azure.resource'),
            tenant: config.get('azure.tenant')
        }, async (accessToken: string, refreshToken: string, params: { id_token: string }, profile: passport.Profile, done: (err: Error | null, user?: User) => void) => {
            const azureProfile = jwt.decode(params.id_token) as { oid: string, tid: string, upn: string, unique_name: string, name: string }
            const outlookMultitendandId = `${azureProfile.oid}@${azureProfile.tid}`

            let user = await AuthService.findUserByOutlookId(outlookMultitendandId)
            if (user) {
                user.accessToken = accessToken
                user.refreshToken = refreshToken
                user.displayName = profile.displayName
                user.lastLogin = new Date()
                return done(null, await user.save())
            } else {
                let userInfo = {};
                getManager().getRepository(Contact).findOne({ mail: azureProfile.upn }).then(contact => {
                    userInfo = {
                        outlookId: outlookMultitendandId,
                        accessToken: accessToken,
                        refreshToken: '',
                        displayName: azureProfile.name,
                        roles: [AuthRoles.AUTHENTICATED],
                        bexioContact: contact || undefined,
                        provider: 'azure'
                    }
                }).catch(() => {
                    userInfo = {
                        outlookId: outlookMultitendandId,
                        accessToken: accessToken,
                        refreshToken: '',
                        displayName: azureProfile.name,
                        roles: [AuthRoles.AUTHENTICATED],
                        provider: 'azure'
                    }
                }).then(async () => {
                    //@ts-ignore
                    if (refreshToken) userInfo.refreshToken = refreshToken

                    //@ts-ignore
                    user = await AuthService.findUserByOutlookId(outlookMultitendandId)
                    if (!user) user = new User()
                    user = Object.assign(user, userInfo)
                    user.lastLogin = new Date()

                    user.save().then(user => {
                        return done(null, user)
                    }).catch((err: Error) => {
                        return done(err)
                    })
                })
            }
        }))
    }
}