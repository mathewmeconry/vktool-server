import * as Express from 'express'
import OrdersController from '../controllers/OrdersController';
import AuthService from '../services/AuthService';import { AuthRoles } from "../interfaces/AuthRoles";

export default function ContactsRoutes(app: Express.Router) {
    app.get('/orders', AuthService.checkAuthorization([AuthRoles.ORDERS_READ]), OrdersController.getOrders)
}