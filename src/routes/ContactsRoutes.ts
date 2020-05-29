import * as Express from 'express';
import ContactsController from '../controllers/ContactsController';
import AuthService from '../services/AuthService';
import { AuthRoles } from '../interfaces/AuthRoles';

export default function ContactsRoutes(app: Express.Router) {
	app.get(
		'/members/pdf',
		AuthService.checkAuthorization([AuthRoles.AUTHENTICATED]),
		ContactsController.getMemberListPdf
	);
}
