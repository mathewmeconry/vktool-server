import * as Express from 'express'
import AuthService from '../services/AuthService';
import UserController from '../controllers/UserController';
import { AuthRoles } from "../interfaces/AuthRoles";

export default function UserRoutes(app: Express.Application) {
    app.get('/api/me', UserController.me)
    app.get('/api/users', AuthService.checkAuthorization(AuthRoles.ADMIN), UserController.users)
}