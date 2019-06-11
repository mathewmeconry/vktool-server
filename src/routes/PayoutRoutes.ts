import * as Express from 'express'
import AuthService from '../services/AuthService';
import { AuthRoles } from '../interfaces/AuthRoles';
import PayoutController from '../controllers/PayoutController';

export default function PayoutRoutes(app: Express.Application) {
    app.get('/api/payouts', AuthService.checkAuthorization([AuthRoles.PAYOUTS_READ]), PayoutController.getPayouts)
    app.put('/api/payouts', AuthService.checkAuthorization([AuthRoles.PAYOUTS_CREATE]), PayoutController.createPayout)
    app.post('/api/payouts/reclaim', AuthService.checkAuthorization([AuthRoles.PAYOUTS_CREATE]), PayoutController.reclaim)
    app.post('/api/payouts/member/pdf', AuthService.checkAuthorization([AuthRoles.PAYOUTS_READ]), PayoutController.generatePDF4Member)
    app.post('/api/payouts/member/html', AuthService.checkAuthorization([AuthRoles.PAYOUTS_READ]), PayoutController.generateHTML4Member)
}