import { AuthRoles, AuthRolesByRank } from "../interfaces/AuthRoles";
import passport from 'passport'
import * as Express from 'express'
//@ts-ignore
import { Strategy as OutlookStrategy } from 'passport-outlook'
import User from '../entities/User';
import Contact from '../entities/Contact';
import config from 'config'
import { getManager } from "typeorm";
import { MockStrategy } from "passport-mock-strategy";
import mockUser = require("passport-mock-strategy/lib/mock-user");

export default class AuthService {
    public static init(app: Express.Application) {
        passport.serializeUser(AuthService.serializeUser);
        passport.deserializeUser(AuthService.deserializeUser);

        AuthService.addOutlookStrategy()

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
        if (process.env.TESTING) passport.use(new MockStrategy({ name: 'mock-admin', user: Object.assign({}, mockUser, { id: 'mock-admin' }) }));
        if (process.env.TESTING) passport.use(new MockStrategy({ name: 'mock-nonadmin', user: Object.assign({}, mockUser, { id: 'mock-nonadmin', provider: 'mock-nonadmin' }) }));

        app.use(passport.initialize())
        app.use(passport.session())
    }

    public static checkAuthorization(roles: Array<AuthRoles>): (req: Express.Request, res: Express.Response, next: Function) => void {
        return function (req, res, next) {
            if (req.isAuthenticated()) {
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
        if (id.split('-')[0] === 'mock') {
            let user = new User()
            user.id = 1
            user.displayName = 'Mock User'
            user.roles = (id.split('-')[1] === 'admin') ? [AuthRoles.ADMIN] : [AuthRoles.AUTHENTICATED]
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

    private static addOutlookStrategy() {
        passport.use(new OutlookStrategy({
            clientID: "2209da49-23d9-4365-95d1-fa2dc84c7a8f",
            clientSecret: "yOB%SiU-yed3V18EL:Z7",
            callbackURL: config.get('apiEndpoint') + '/api/auth/outlook/callback'
        },
            async function (accessToken: string, refreshToken: string, profile: { id: string, displayName: string, emails: Array<{ value: string }> }, done: any) {
                let matched = false
                for (let email of profile.emails) {
                    if (email.value.match(/@vkazu\.ch$/)) matched = true
                }

                if (!matched) {
                    return done(new Error('No accepted Organization'))
                }

                let user = await AuthService.findUserByOutlookId(profile.id)
                if (user) {
                    user.accessToken = accessToken
                    user.refreshToken = refreshToken
                    user.displayName = profile.displayName
                    user.lastLogin = new Date()
                    return done(null, await user.save())
                } else {
                    let userInfo = {};
                    getManager().getRepository(Contact).findOne({ mail: profile.emails[0].value }).then(contact => {
                        userInfo = {
                            outlookId: profile.id,
                            accessToken: accessToken,
                            refreshToken: '',
                            displayName: profile.displayName,
                            roles: [AuthRoles.AUTHENTICATED],
                            bexioContact: contact || undefined,
                            provider: 'office365'
                        }
                    }).catch(() => {
                        userInfo = {
                            outlookId: profile.id,
                            accessToken: accessToken,
                            displayName: profile.displayName,
                            roles: [AuthRoles.AUTHENTICATED],
                            refreshToken: '',
                            provider: 'office365'
                        }
                    }).then(async () => {
                        //@ts-ignore
                        if (refreshToken) userInfo.refreshToken = refreshToken

                        //@ts-ignore
                        user = await AuthService.findUserByOutlookId(user.outlookId)
                        if (!user) user = new User()
                        user = Object.assign(user, userInfo)
                        user.lastLogin = new Date()

                        user.save().then(user => {
                            return done(null, user)
                        }).catch(err => {
                            return done(err)
                        })
                    })
                }
            }
        ));
    }
}