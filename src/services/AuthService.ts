import { AuthRoles } from "../interfaces/AuthRoles";
import passport from 'passport'
import * as Express from 'express'
//@ts-ignore
import { Strategy as OutlookStrategy } from 'passport-outlook'
import User from '../entities/User';
import Contact from '../entities/Contact';
import config from 'config'
import { getManager } from "typeorm";

export default class AuthService {
    public static init(app: Express.Application) {
        passport.serializeUser(AuthService.serializeUser);
        passport.deserializeUser(AuthService.deserializeUser);

        AuthService.addOutlookStrategy()

        app.use(passport.initialize())
        app.use(passport.session())
    }

    public static checkAuthorization(role: AuthRoles): (req: Express.Request, res: Express.Response, next: Function) => void {
        return function (req, res, next) {
            if (AuthService.isAuthorized(req, role)) {
                next()
            } else {
                res.status(401)
                res.send({
                    error: 'Not authorized'
                })
            }
        }
    }

    public static isAuthorized(req: Express.Request, role: AuthRoles): boolean {
        if (req.isAuthenticated() && (req.user.roles.indexOf(role) > -1 || req.user.roles.indexOf(AuthRoles.ADMIN) > -1)) {
            return true
        }

        return false
    }

    public static isAuthenticated(req: Express.Request, res: Express.Response): boolean {
        return req.isAuthenticated()
    }

    public static serializeUser(user: User, done: (err: any, userId?: string) => void): void {
        done(null, user.id.toString());
    }

    public static deserializeUser(id: string, done: (err: any, user?: User) => void): void {
        getManager().getRepository(User).find({ id: parseInt(id) })
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

    public static async findUserByOutlookId(outlookId: string): Promise<User | undefined> {
        return getManager().getRepository(User).findOne({ outlookId: outlookId })
    }

    public static addOutlookStrategy() {
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
                    user.accessToken = accessToken,
                        user.refreshToken = refreshToken
                    user.displayName = profile.displayName
                    await getManager().getRepository(User).save(user)
                    return done(null, user)
                } else {
                    let userInfo = {};
                    getManager().getRepository(Contact).findOne({ mail: profile.emails[0].value }).then(contact => {
                        userInfo = {
                            outlookId: profile.id,
                            accessToken: accessToken,
                            refreshToken: '',
                            displayName: profile.displayName,
                            roles: [AuthRoles.MEMBERS_READ, AuthRoles.AUTHENTICATED, AuthRoles.ADMIN],
                            bexioContact: contact || undefined
                        }
                    }).catch(() => {
                        userInfo = {
                            outlookId: profile.id,
                            accessToken: accessToken,
                            displayName: profile.displayName,
                            roles: [AuthRoles.MEMBERS_READ, AuthRoles.AUTHENTICATED, AuthRoles.ADMIN],
                            refreshToken: ''
                        }
                    }).then(async () => {
                        //@ts-ignore
                        if (refreshToken) userInfo.refreshToken = refreshToken
                        let UserRepo = getManager().getRepository(User)

                        //@ts-ignore
                        user = await UserRepo.findOne({ outlookId: userInfo.outlookId })
                        if (!user) user = new User()
                        user = Object.assign(user, userInfo)

                        getManager().getRepository(User).save(user).then(user => {
                            console.log(user)
                            return done(null, user)
                        }).catch(err => {
                            console.log(err)
                            return done(err)
                        })
                    })
                }
            }
        ));
    }
}