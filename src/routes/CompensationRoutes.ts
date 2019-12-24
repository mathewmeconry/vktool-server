import { AuthRoles } from "../interfaces/AuthRoles";
import * as Express from 'express'
import CompensationController from '../controllers/CompensationController';
import AuthService from '../services/AuthService';

export default function CompensationRoutes(app: Express.Application) {
    app.get('/api/compensations', AuthService.checkAuthorization([AuthRoles.COMPENSATIONS_READ, AuthRoles.AUTHENTICATED]), CompensationController.getAll)

    app.put('/api/compensations', AuthService.checkAuthorization([AuthRoles.COMPENSATIONS_CREATE, AuthRoles.BILLINGREPORTS_EDIT, AuthRoles.BILLINGREPORTS_CREATE]), CompensationController.add)
    app.put('/api/compensations/bulk',  AuthService.checkAuthorization([AuthRoles.COMPENSATIONS_CREATE, AuthRoles.BILLINGREPORTS_EDIT, AuthRoles.BILLINGREPORTS_CREATE]), CompensationController.addBulk)

    app.post('/api/compensations/approve', AuthService.checkAuthorization([AuthRoles.COMPENSATIONS_APPROVE]), CompensationController.approve)

    app.delete('/api/compensations', AuthService.checkAuthorization([AuthRoles.COMPENSATIONS_EDIT]), CompensationController.delete)
}