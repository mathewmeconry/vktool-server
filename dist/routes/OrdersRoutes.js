"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const OrdersController_1 = __importDefault(require("../controllers/OrdersController"));
const AuthService_1 = __importDefault(require("../services/AuthService"));
const AuthRoles_1 = require("../interfaces/AuthRoles");
function ContactsRoutes(app) {
    app.get('/api/orders', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.ORDERS_READ]), OrdersController_1.default.getOrders);
}
exports.default = ContactsRoutes;
//# sourceMappingURL=OrdersRoutes.js.map