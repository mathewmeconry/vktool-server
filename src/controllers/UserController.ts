import * as Express from 'express'
import AuthService from '../services/AuthService';
import User from '../entities/User';
import { getManager } from 'typeorm';

export default class UserController {
    public static async me(req: Express.Request, res: Express.Response): Promise<void> {
        if (AuthService.isAuthenticated(req, res)) {
            res.send(req.user)
        } else {
            res.send({})
        }
    }

    public static async users(req: Express.Request, res: Express.Response): Promise<void> {
        res.send(await getManager().getRepository(User).find())
    }
}