import * as Express from 'express'
import BillingReportController from '../controllers/BillingReportController';
import AuthService from '../services/AuthService'; import { AuthRoles } from "../interfaces/AuthRoles";

export default function BillingReportRoutes(app: Express.Application) {
    app.get('/api/billing-reports', AuthService.checkAuthorization(AuthRoles.BILLINGREPORTS_READ), BillingReportController.getBillingReports)
    app.get('/api/billing-reports/open', AuthService.checkAuthorization(AuthRoles.BILLINGREPORTS_READ), BillingReportController.getOpenOrders)
    app.post('/api/billing-reports/approve', AuthService.checkAuthorization(AuthRoles.BILLINGREPORTS_EDIT), BillingReportController.approve)
    app.post('/api/billing-reports', AuthService.checkAuthorization(AuthRoles.BILLINGREPORTS_EDIT), BillingReportController.edit)
    app.put('/api/billing-reports', AuthService.checkAuthorization(AuthRoles.BILLINGREPORTS_CREATE), BillingReportController.put)
}