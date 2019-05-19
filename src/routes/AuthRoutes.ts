import * as Express from 'express'
import AuthController from '../controllers/AuthController';
import passport = require('passport');
import { AuthRoles } from '../interfaces/AuthRoles';
import AuthService from '../services/AuthService';

export default function AuthRoutes(app: Express.Application) {
    app.get('/api/isauth', AuthController.isAuth)
    app.get('/api/auth/azure', AuthController.authAzure)
    app.get('/api/auth/azure/callback', AuthController.callbackAzure)
    app.get('/api/logout', AuthController.logout)

    // route for mocked login 
    if (process.env.TESTING) app.get('/api/auth/mock-admin', passport.authenticate('mock-admin'))
    if (process.env.TESTING) app.get('/api/auth/mock', passport.authenticate('mock-nonadmin'))
    if (process.env.TESTING) app.get('/check/authservice', AuthService.checkAuthorization([AuthRoles.MEMBERS_READ]), (req, res) => { res.status(200); res.send('') })
}