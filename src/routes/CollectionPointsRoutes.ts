import * as Express from 'express'
import AuthService from '../services/AuthService';
import { AuthRoles } from '../interfaces/AuthRoles';
import CollectionPointsController from '../controllers/CollectionPointsController';

export default function CollectionPointsRoutes(app: Express.Router) {
    app.get('/collection-points', AuthService.checkAuthorization([AuthRoles.DRAFT_READ]), CollectionPointsController.getCollectionPoints)
    app.put('/collection-points', AuthService.checkAuthorization([AuthRoles.DRAFT_EDIT, AuthRoles.DRAFT_CREATE]), CollectionPointsController.addCollectionPoint)
}