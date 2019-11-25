import * as Express from 'express'
import AuthService from '../services/AuthService';
import { AuthRoles } from '../interfaces/AuthRoles';
import PayoutController from '../controllers/PayoutController';

export default function PayoutRoutes(app: Express.Application) {
    app.get('/api/payouts', AuthService.checkAuthorization([AuthRoles.PAYOUTS_READ]), PayoutController.getPayouts)
    app.get('/api/payouts/:payout/pdf', AuthService.checkAuthorization([AuthRoles.PAYOUTS_READ]), PayoutController.generatePayoutPDF)
    app.get('/api/payouts/:payout/:member/pdf', AuthService.checkAuthorization([AuthRoles.PAYOUTS_READ]), PayoutController.generateMemberPDF)
    app.post('/api/payouts/:payout/:member/html', AuthService.checkAuthorization([AuthRoles.PAYOUTS_READ]), PayoutController.generateMemberHTML)
    app.get('/api/payouts/:payout/xml', AuthService.checkAuthorization([AuthRoles.PAYOUTS_SEND]), PayoutController.generateXml)

    app.put('/api/payouts', AuthService.checkAuthorization([AuthRoles.PAYOUTS_CREATE]), PayoutController.createPayout)

    app.post('/api/payouts/reclaim', AuthService.checkAuthorization([AuthRoles.PAYOUTS_CREATE]), PayoutController.reclaim)
    app.post('/api/payouts/member/pdf', AuthService.checkAuthorization([AuthRoles.PAYOUTS_READ]), PayoutController.generateMemberPDF)
    app.post('/api/payouts/member/html', AuthService.checkAuthorization([AuthRoles.PAYOUTS_READ]), PayoutController.generateMemberHTML)
    app.post('/api/payouts/email', AuthService.checkAuthorization([AuthRoles.PAYOUTS_SEND]), PayoutController.sendMails)
    app.post('/api/payouts/bexio', AuthService.checkAuthorization([AuthRoles.PAYOUTS_SEND]), PayoutController.sendToBexio)
    app.post('/api/payouts/xml', AuthService.checkAuthorization([AuthRoles.PAYOUTS_SEND]), PayoutController.generateXml)
    app.post('/api/payouts/transfer', AuthService.checkAuthorization([AuthRoles.COMPENSATIONS_EDIT]), PayoutController.transfer)
}