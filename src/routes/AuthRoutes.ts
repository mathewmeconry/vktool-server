import * as Express from 'express'
import AuthController from '../controllers/AuthController';
import passport = require('passport');
import { AuthRoles } from '../interfaces/AuthRoles';
import AuthService from '../services/AuthService';

export default function AuthRoutes(app: Express.Router) {
    app.get('/isauth', AuthController.isAuth)
    app.get('/auth/azure', AuthController.authAzure)
    app.get('/auth/azure/callback', AuthController.callbackAzure)
    app.get('/logout', AuthController.logout)

    // route for mocked login 
    if (process.env.TESTING) app.get('/auth/mock-admin', passport.authenticate('mock-admin'), (req, res) => { res.send(req.user) })
    if (process.env.TESTING) app.get('/auth/mock', passport.authenticate('mock-nonadmin'), (req, res) => { res.send(req.user) })
    if (process.env.TESTING) app.get('/check/authservice', AuthService.checkAuthorization([AuthRoles.MEMBERS_READ]), (req, res) => { res.status(200); res.send('') })
}