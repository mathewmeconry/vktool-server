import * as Express from 'express';
import MaterialChangelogController from '../controllers/MaterialChangelogController'
import { AuthRoles } from '../interfaces/AuthRoles';
import AuthService from '../services/AuthService';

export default function MaterialChangelogRoutes(app: Express.Router) {
    app.get('/materialchangelog/:id/pdf', AuthService.checkAuthorization([AuthRoles.MATERIAL_CHANGELOG_READ]), MaterialChangelogController.getReceipt)
}
