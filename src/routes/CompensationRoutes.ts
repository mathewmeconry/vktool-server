import { AuthRoles } from "../interfaces/AuthRoles";
import * as Express from 'express'
import CompensationController from '../controllers/CompensationController';
import AuthService from '../services/AuthService';

export default function CompensationRoutes(app: Express.Application) {
    app.get('/api/compensations', AuthService.checkAuthorization(AuthRoles.COMPENSATIONS_READ), CompensationController.getAll)
    app.get('/api/compensations/:member', AuthService.checkAuthorization(AuthRoles.COMPENSATIONS_READ), CompensationController.getUser)
    app.put('/api/compensations', AuthService.checkAuthorization(AuthRoles.COMPENSATIONS_CREATE), CompensationController.add)
    app.post('/api/compensations/approve', AuthService.checkAuthorization(AuthRoles.COMPENSATIONS_APPROVE), CompensationController.approve)
}