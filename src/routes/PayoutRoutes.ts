import * as Express from 'express'
import AuthService from '../services/AuthService';
import { AuthRoles } from '../interfaces/AuthRoles';
import PayoutController from '../controllers/PayoutController';

export default function PayoutRoutes(app: Express.Router) {
    app.get('/payouts/:payout/pdf', AuthService.checkAuthorization([AuthRoles.PAYOUTS_READ]), PayoutController.generatePayoutOverviewPDF)
    app.get('/payouts/:payout/:member/pdf', AuthService.checkAuthorization([AuthRoles.PAYOUTS_READ]), PayoutController.generateMemberPDF)
    app.get('/payouts/:payout/xml', AuthService.checkAuthorization([AuthRoles.PAYOUTS_SEND]), PayoutController.generateXml)
    app.post('/payouts/member/pdf', AuthService.checkAuthorization([AuthRoles.PAYOUTS_READ]), PayoutController.generateMemberPDF)
    app.post('/payouts/xml', AuthService.checkAuthorization([AuthRoles.PAYOUTS_SEND]), PayoutController.generateXml)
}