import * as Express from 'express'
import BillingReportController from '../controllers/BillingReportController';
import { param, body } from 'express-validator/check'
import Order from '../entities/Order';
import Contact from '../entities/Contact';
import { Types } from 'mongoose';
import AuthService from '../services/AuthService';import { AuthRoles } from "../interfaces/AuthRoles";

export default function BillingReportRoutes(app: Express.Application) {
    app.get('/api/billing-reports', AuthService.checkAuthorization(AuthRoles.BILLINGREPORTS_READ),BillingReportController.getBillingReports)
    app.get('/api/billing-reports/open', AuthService.checkAuthorization(AuthRoles.BILLINGREPORTS_READ), BillingReportController.getOpenOrders)
    app.post('/api/billing-reports/approve', AuthService.checkAuthorization(AuthRoles.BILLINGREPORTS_EDIT), BillingReportController.approve)
    app.post('/api/billing-reports', AuthService.checkAuthorization(AuthRoles.BILLINGREPORTS_EDIT), BillingReportController.edit)
    app.put('/api/billing-reports', AuthService.checkAuthorization(AuthRoles.BILLINGREPORTS_CREATE), [
        body('orderId').custom(value => {
            return Order.aggregate(
                [
                    { "$match": { "_id": new Types.ObjectId(value) } },
                    { "$limit": 1 }
                ]).then(contact => {
                    if (contact.length === 0) {
                        throw new Error('order not found')
                    }
                })
        }),
        body('creatorId').custom(value => {
            return Contact.aggregate(
                [
                    { "$match": { "_id": new Types.ObjectId(value) } },
                    { "$limit": 1 }
                ]).then(contact => {
                    if (contact.length === 0) {
                        throw new Error('creator not found')
                    }
                })
        }),
        body('date').toDate(),
        body('food').isBoolean(),
        body('compensationEntries').custom(value => {
            for (let i in value) {
                if(!value[i].from)  throw new Error('from missing')
                if(!value[i].until)  throw new Error('until missing')

                Contact.aggregate(
                    [
                        { "$match": { "_id": new Types.ObjectId(i) } },
                        { "$limit": 1 }
                    ]).then(contact => {
                        if (contact.length === 0) {
                            throw new Error('member not found')
                        }
                    })
            }
        })
    ], BillingReportController.put)
}