"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ContactsController_1 = __importDefault(require("../controllers/ContactsController"));
const AuthService_1 = __importDefault(require("../services/AuthService"));
const AuthRoles_1 = require("../interfaces/AuthRoles");
function ContactsRoutes(app) {
    app.get('/api/contacts', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.CONTACTS_READ]), ContactsController_1.default.getContacts);
    app.get('/api/members', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.MEMBERS_READ]), ContactsController_1.default.getMembers);
    app.get('/api/ranks', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.RANKS_READ]), ContactsController_1.default.getRanks);
}
exports.default = ContactsRoutes;
//# sourceMappingURL=ContactsRoutes.js.map