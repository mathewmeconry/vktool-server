import { AuthRoles } from "../interfaces/AuthRoles";
import * as Express from 'express'
import CompensationController from '../controllers/CompensationController';
import AuthService from '../services/AuthService';

export default function CompensationRoutes(app: Express.Router) {
    app.get('/compensations', AuthService.checkAuthorization([AuthRoles.COMPENSATIONS_READ, AuthRoles.AUTHENTICATED]), CompensationController.getAll)

    app.put('/compensations', AuthService.checkAuthorization([AuthRoles.COMPENSATIONS_CREATE, AuthRoles.BILLINGREPORTS_EDIT, AuthRoles.BILLINGREPORTS_CREATE]), CompensationController.add)
    app.put('/compensations/bulk',  AuthService.checkAuthorization([AuthRoles.COMPENSATIONS_CREATE, AuthRoles.BILLINGREPORTS_EDIT, AuthRoles.BILLINGREPORTS_CREATE]), CompensationController.addBulk)

    app.post('/compensations/approve', AuthService.checkAuthorization([AuthRoles.COMPENSATIONS_APPROVE]), CompensationController.approve)

    app.delete('/compensations', AuthService.checkAuthorization([AuthRoles.COMPENSATIONS_EDIT]), CompensationController.delete)
}