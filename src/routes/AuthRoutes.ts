import * as Express from 'express'
import AuthController from '../controllers/AuthController';
import passport = require('passport');

export default function AuthRoutes(app: Express.Application) {
    app.get('/api/isauth', AuthController.isAuth)
    app.get('/api/auth/outlook', AuthController.auth)
    app.get('/api/auth/outlook/callback', AuthController.callback)
    app.get('/api/logout', AuthController.logout)

    // route for mocked login
    if (process.env.TESTING) app.get('/api/auth/mock', passport.authenticate('mock'))
}