import * as Express from 'express'
import AuthService from '../services/AuthService';
import { AuthRoles } from '../interfaces/AuthRoles';
import PayoutController from '../controllers/PayoutController';

export default function PayoutRoutes(app: Express.Router) {
    app.get('/payouts', AuthService.checkAuthorization([AuthRoles.PAYOUTS_READ]), PayoutController.getPayouts)
    app.get('/payouts/:payout/pdf', AuthService.checkAuthorization([AuthRoles.PAYOUTS_READ]), PayoutController.generatePayoutOverviewPDF)
    app.get('/payouts/:payout/:member/pdf', AuthService.checkAuthorization([AuthRoles.PAYOUTS_READ]), PayoutController.generateMemberPDF)
    app.post('/payouts/:payout/:member/html', AuthService.checkAuthorization([AuthRoles.PAYOUTS_READ]), PayoutController.generateMemberHTML)
    app.get('/payouts/:payout/xml', AuthService.checkAuthorization([AuthRoles.PAYOUTS_SEND]), PayoutController.generateXml)

    app.put('/payouts', AuthService.checkAuthorization([AuthRoles.PAYOUTS_CREATE]), PayoutController.createPayout)

    app.post('/payouts/reclaim', AuthService.checkAuthorization([AuthRoles.PAYOUTS_CREATE]), PayoutController.reclaim)
    app.post('/payouts/member/pdf', AuthService.checkAuthorization([AuthRoles.PAYOUTS_READ]), PayoutController.generateMemberPDF)
    app.post('/payouts/member/html', AuthService.checkAuthorization([AuthRoles.PAYOUTS_READ]), PayoutController.generateMemberHTML)
    app.post('/payouts/email', AuthService.checkAuthorization([AuthRoles.PAYOUTS_SEND]), PayoutController.sendMails)
    app.post('/payouts/bexio', AuthService.checkAuthorization([AuthRoles.PAYOUTS_SEND]), PayoutController.sendToBexio)
    app.post('/payouts/xml', AuthService.checkAuthorization([AuthRoles.PAYOUTS_SEND]), PayoutController.generateXml)
    app.post('/payouts/transfer', AuthService.checkAuthorization([AuthRoles.COMPENSATIONS_EDIT]), PayoutController.transfer)
}