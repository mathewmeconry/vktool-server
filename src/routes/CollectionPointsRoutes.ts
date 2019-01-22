import * as Express from 'express'
import AuthService from '../services/AuthService';
import { AuthRoles } from '../interfaces/AuthRoles';
import CollectionPointsController from '../controllers/CollectionPointsController';

export default function CollectionPointsRoutes(app: Express.Application) {
    app.get('/api/collection-points', AuthService.checkAuthorization([AuthRoles.DRAFT_READ]), CollectionPointsController.getCollectionPoints)
    app.put('/api/collection-points', AuthService.checkAuthorization([AuthRoles.DRAFT_EDIT, AuthRoles.DRAFT_CREATE]), CollectionPointsController.addCollectionPoint)
}