import * as Express from 'express';
import { AuthRoles } from '../interfaces/AuthRoles';
import AuthService from '../services/AuthService';
import ContactService from '../services/ContactService';
import moment from 'moment';
import PdfService from '../services/PdfService';

export default class ContactsController {
	public static async getMemberListPdf(req: Express.Request, res: Express.Response): Promise<void> {
		let members = await ContactService.getActiveMembers(
			AuthService.isAuthorized(req.user.roles, AuthRoles.MEMBERS_READ)
		);
		members = members.sort((a, b) =>
			`${a.lastname} ${a.firstname}` < `${b.lastname} ${b.firstname}` ? -1 : 1
		);
		res.contentType('application/pdf');
		res.setHeader(
			'Content-Disposition',
			`inline; filename=Mitgliederliste ${moment(new Date()).format('DD-MM-YYYY')}.pdf`
		);
		res.send(await PdfService.generateMemberList(members));
	}
}
