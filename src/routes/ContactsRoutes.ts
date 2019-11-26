import * as Express from 'express'
import ContactsController from '../controllers/ContactsController';
import AuthService from '../services/AuthService';
import { AuthRoles } from "../interfaces/AuthRoles";

export default function ContactsRoutes(app: Express.Application) {
    app.get('/api/contacts', AuthService.checkAuthorization([AuthRoles.CONTACTS_READ]), ContactsController.getContacts)
    app.post('/api/contacts', AuthService.checkAuthorization([AuthRoles.CONTACTS_EDIT]), ContactsController.postContact)
    
    app.get('/api/members', AuthService.checkAuthorization([AuthRoles.MEMBERS_READ, AuthRoles.BILLINGREPORTS_CREATE]), ContactsController.getMembers)
    app.post('/api/members', AuthService.checkAuthorization([AuthRoles.CONTACTS_EDIT]), ContactsController.postContact)

    app.get('/api/members/pdf', AuthService.checkAuthorization([AuthRoles.AUTHENTICATED]), ContactsController.getMemberListPdf)

    app.get('/api/ranks', AuthService.checkAuthorization([AuthRoles.RANKS_READ]), ContactsController.getRanks)
}