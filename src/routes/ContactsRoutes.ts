import * as Express from 'express'
import ContactsController from '../controllers/ContactsController';
import AuthService from '../services/AuthService';
import { AuthRoles } from "../interfaces/AuthRoles";

export default function ContactsRoutes(app: Express.Application) {
    app.get('/api/contacts', AuthService.checkAuthorization([AuthRoles.CONTACTS_READ]), ContactsController.getContacts)
    app.get('/api/members', AuthService.checkAuthorization([AuthRoles.MEMBERS_READ]), ContactsController.getMembers)
    app.get('/api/ranks', AuthService.checkAuthorization([AuthRoles.RANKS_READ]), ContactsController.getRanks)
}