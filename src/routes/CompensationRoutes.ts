import { AuthRoles } from "../interfaces/AuthRoles";
import * as Express from 'express'
import CompensationController from '../controllers/CompensationController';
import { param, body } from 'express-validator/check'
import Contact from '../entities/Contact';
import ContactGroup from '../entities/ContactGroup';
import { Types } from 'mongoose';
import AuthService from '../services/AuthService';
import ContactModel from "../models/ContactModel";

export default function CompensationRoutes(app: Express.Application) {
    app.get('/api/compensations', AuthService.checkAuthorization(AuthRoles.COMPENSATIONS_READ), CompensationController.getAll)
    app.get('/api/compensations/:member', AuthService.checkAuthorization(AuthRoles.COMPENSATIONS_READ),
        param('member').custom((value: string) => {
            return Contact.aggregate(
                [
                    {
                        "$lookup": {
                            "from": ContactGroup.collection.name,
                            "localField": "contactGroups",
                            "foreignField": "_id",
                            "as": "contactGroups"
                        }
                    },
                    { "$match": { "contactGroups": { $elemMatch: { bexioId: 7 } } } },
                    { "$match": { "_id": new Types.ObjectId(value) } },
                    { "$limit": 1 }
                ]).then(contact => {
                    if (contact.length === 0) {
                        throw new Error('member not found')
                    }
                })
        }),
        CompensationController.getUser)

    app.put('/api/compensations', AuthService.checkAuthorization(AuthRoles.COMPENSATIONS_CREATE), [
        body('member').custom((value: string) => {
            return Contact.aggregate(
                [
                    {
                        "$lookup": {
                            "from": ContactGroup.collection.name,
                            "localField": "contactGroups",
                            "foreignField": "_id",
                            "as": "contactGroups"
                        }
                    },
                    { "$match": { "contactGroups": { $elemMatch: { bexioId: 7 } } } },
                    { "$match": { "_id": new Types.ObjectId(value) } },
                    { "$limit": 1 }
                ]).then((contact: Array<ContactModel>) => {
                    if (contact.length === 0) {
                        throw new Error('member not found')
                    }
                })
        }),
        body('amount').isNumeric(),
        body('date').toDate()
    ], CompensationController.add)
}