import * as Express from 'express'
import AuthController from '../controllers/AuthController';

export default function AuthRoutes(app: Express.Application) {
    app.get('/api/isauth', AuthController.isAuth)
    app.get('/api/auth/outlook', AuthController.auth)
    app.get('/api/auth/outlook/callback', AuthController.callback)
    app.get('/api/logout', AuthController.logout)
}