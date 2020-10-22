import * as Express from 'express';
import WarehouseController from '../controllers/WarehouseController'
import { AuthRoles } from '../interfaces/AuthRoles';
import AuthService from '../services/AuthService';

export default function WarehouseRoutes(app: Express.Router) {
    app.get('/warehouse/:id/report', AuthService.checkAuthorization([AuthRoles.WAREHOUSE_READ]), WarehouseController.getReport)
    app.get('/warehouses/report', AuthService.checkAuthorization([AuthRoles.WAREHOUSE_READ]), WarehouseController.getTotalReport)
}
