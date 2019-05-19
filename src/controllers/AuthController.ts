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

    public static async authAzure(req: Express.Request, res: Express.Response, next: Function): Promise<void> {
        passport.authenticate('azure_ad_oauth2')(req, res, next)
    }

    public static async callbackAzure(req: Express.Request, res: Express.Response, next: Function): Promise<void> {
        passport.authenticate('azure_ad_oauth2', { failureRedirect: '/login' })(req, res, () => {
            res.redirect(config.get('clientHost'))
        })
    }

    public static logout(req: Express.Request, res: Express.Response): void {
        req.logout()
        res.redirect(config.get('clientHost') + '/login')
    }
}