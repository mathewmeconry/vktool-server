import { AuthRoles } from "../interfaces/AuthRoles";
import passport from 'passport'
import * as Express from 'express'
//@ts-ignore
import { Strategy as OutlookStrategy } from 'passport-outlook'
import User from '../entities/User';
import Contact from '../entities/Contact';
import { Types } from 'mongoose';
import UserModel from '../models/UserModel';
import config from 'config'

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
        return true
        if (req.isAuthenticated() && (req.user.roles.indexOf(role) > -1 || req.user.roles.indexOf(AuthRoles.ADMIN) > -1)) {
            return true
        }

        return false
    }

    public static isAuthenticated(req: Express.Request, res: Express.Response): boolean {
        return req.isAuthenticated()
    }

    public static serializeUser(user: UserModel, done: (err: any, userId?: string) => void): void {
        done(null, user._id);
    }

    public static deserializeUser(id: string, done: (err: any, user?: UserModel) => void): void {
        User.aggregate([
            {
                "$lookup": {
                    "from": Contact.collection.name,
                    "localField": "bexioContact",
                    "foreignField": "_id",
                    "as": "bexioContact"
                }
            },
            {
                "$unwind": {
                    "path": "$bexioContact",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                "$match": {
                    "_id": new Types.ObjectId(id)
                }
            }
        ]).then(user => {
            if (user && user.length === 1) {
                done(null, user[0])
            } else {
                done('no User found')
            }
        }).catch(err => {
            done(err)
        })
    }

    public static async findUserByOutlookId(outlookId: string): Promise<UserModel | null> {
        return User.findOne({ outlookId: outlookId })
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
                    user.save()
                    return done(null, user)
                } else {
                    let userInfo = {};
                    Contact.findOne({ mail: profile.emails[0].value }).then(contact => {
                        userInfo = {
                            outlookId: profile.id,
                            accessToken: accessToken,
                            refreshToken: '',
                            displayName: profile.displayName,
                            roles: [AuthRoles.MEMBERS_READ, AuthRoles.AUTHENTICATED],
                            bexioContact: contact || undefined
                        }
                    }).catch(() => {
                        userInfo = {
                            outlookId: profile.id,
                            accessToken: accessToken,
                            displayName: profile.displayName,
                            roles: [AuthRoles.MEMBERS_READ, AuthRoles.AUTHENTICATED],
                            refreshToken: ''
                        }
                    }).then(() => {
                        //@ts-ignore
                        if (refreshToken) userInfo.refreshToken = refreshToken
                        //@ts-ignore
                        User.findOneAndUpdate({ outlookId: userInfo.outlookId }, userInfo, { upsert: true }, (err, user) => {
                            return done(err, user)
                        })
                    })
                }
            }
        ));
    }
}