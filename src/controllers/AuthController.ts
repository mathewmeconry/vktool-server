import * as Express from 'express'
import passport from 'passport'
import AuthService from '../services/AuthService';
import config from 'config'

export default class AuthController {
    public static async isAuth(req: Express.Request, res: Express.Response): Promise<void> {
        res.send({
            authenticated: AuthService.isAuthenticated(req, res)
        })
    }

    public static async auth(req: Express.Request, res: Express.Response): Promise<void> {
        passport.authenticate('windowslive', {
            scope: [
                'openid',
                'https://outlook.office.com/Mail.Read',
                'profile',
                'offline_access'
            ]
        })(req, res)
    }

    public static async callback(req: Express.Request, res: Express.Response, next: Function): Promise<void> {
        passport.authenticate('windowslive', { failureRedirect: '/login?error' }, (err, user, info) => {
            req.login(user, (err) => {
                if (err && (Object.keys(err).length !== 0 && err.constructor === Object)) {
                    res.send(err)
                } else {
                    res.redirect(config.get('clientHost'))
                }
            })
        })(req, res, next)
    }

    public static logout(req: Express.Request, res: Express.Response): void {
        req.logout()
        res.redirect('/')
    }
}