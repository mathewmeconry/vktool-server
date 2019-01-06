import * as Express from 'express'
import AuthService from '../services/AuthService';
import User from '../entities/User';
import Contact from '../entities/Contact';

export default class UserController {
    public static async me(req: Express.Request, res: Express.Response): Promise<void> {
        if (AuthService.isAuthenticated(req, res)) {
            res.send(req.user)
        } else {
            res.send({})
        }
    }

    public static async users(req: Express.Request, res: Express.Response): Promise<void> {
        let users = await User.aggregate(
            [
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
                }
            ])

        res.send(users)
    }
}