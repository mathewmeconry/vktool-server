import { AuthRoles } from "../interfaces/AuthRoles";
import * as Express from 'express'
import CompensationController from '../controllers/CompensationController';
import { param, body } from 'express-validator/check'
import Contact from '../entities/Contact';
import { Types } from 'mongoose';
import AuthService from '../services/AuthService';
import ContactGroupModel from "../models/ContactGroupModel";

export default function CompensationRoutes(app: Express.Application) {
    app.get('/api/compensations', AuthService.checkAuthorization(AuthRoles.COMPENSATIONS_READ), CompensationController.getAll)
    app.get('/api/compensations/:member', AuthService.checkAuthorization(AuthRoles.COMPENSATIONS_READ),
        param('member').custom((value: string) => {
            return Contact.findOne({ _id: new Types.ObjectId(value) }).populate('contactGroups').then(contact => {
                if (contact) {
                    if ((contact.contactGroups as Array<ContactGroupModel>).find(elem => elem.bexioId === 7)) {
                        throw new Error('member not found')
                    }
                } else {
                    throw new Error('member not found')
                }
            })
        }),
        CompensationController.getUser)

    app.put('/api/compensations', AuthService.checkAuthorization(AuthRoles.COMPENSATIONS_CREATE), [
        body('member').custom((value: string) => {
            return Contact.findOne({ _id: new Types.ObjectId(value) }).populate('contactGroups').then(contact => {
                if (contact) {
                    if ((contact.contactGroups as Array<ContactGroupModel>).find(elem => elem.bexioId === 7)) {
                        throw new Error('member not found')
                    }
                } else {
                    throw new Error('member not found')
                }
            })
        }),
        body('amount').isNumeric(),
        body('date').toDate()
    ], CompensationController.add)
}