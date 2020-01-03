import * as Express from 'express'
import AuthService from '../services/AuthService';
import UserController from '../controllers/UserController';
import { AuthRoles } from "../interfaces/AuthRoles";

export default function UserRoutes(app: Express.Router) {
    app.get('/me', UserController.me)
    app.get('/users', AuthService.checkAuthorization([AuthRoles.ADMIN]), UserController.users)
}