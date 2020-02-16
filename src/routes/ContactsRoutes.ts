import * as Express from 'express'
import ContactsController from '../controllers/ContactsController';
import AuthService from '../services/AuthService';
import { AuthRoles } from "../interfaces/AuthRoles";

export default function ContactsRoutes(app: Express.Router) {
    app.get('/contacts', AuthService.checkAuthorization([AuthRoles.CONTACTS_READ, AuthRoles.AUTHENTICATED]), ContactsController.getContacts)
    app.post('/contacts', AuthService.checkAuthorization([AuthRoles.CONTACTS_EDIT]), ContactsController.postContact)
    
    app.get('/members', AuthService.checkAuthorization([AuthRoles.MEMBERS_READ, AuthRoles.BILLINGREPORTS_CREATE]), ContactsController.getMembers)
    app.post('/members', AuthService.checkAuthorization([AuthRoles.CONTACTS_EDIT]), ContactsController.postContact)

    app.get('/members/pdf', AuthService.checkAuthorization([AuthRoles.AUTHENTICATED]), ContactsController.getMemberListPdf)

    app.get('/ranks', AuthService.checkAuthorization([AuthRoles.RANKS_READ]), ContactsController.getRanks)
}