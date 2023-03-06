import * as Express from 'express';
import ContactService from '../services/ContactService';
import moment from 'moment';
import PdfService from '../services/PdfService';

export default class ContactsController {
	public static async getMemberListPdf(req: Express.Request, res: Express.Response): Promise<void> {
		let members = await ContactService.getActiveMembers(false);

		res.contentType('application/pdf');
		res.setHeader(
			'Content-Disposition',
			`inline; filename=Mitgliederliste ${moment(new Date()).format('DD-MM-YYYY')}.pdf`
		);
		res.send(await PdfService.generateMemberList(members));
	}

	public static async getMemberListCsv(req: Express.Request, res: Express.Response): Promise<void> {
		let members = await ContactService.getActiveMembers(false);

		const csv = [
			[
				'Vorname',
				'Nachname',
				'Grad',
				'Funktionen',
				'Adresse',
				'Abholpunk',
				'Festnetz',
				'Mobile',
				'Festnetz',
			].join(';'),
		];
		for (const member of members) {
			csv.push(
				[
					member.firstname,
					member.lastname,
					member.rank || '',
					(member.functions || []).join(','),
					member.address,
					member.extension?.collectionPoint?.address || '',
					member.phoneFixed || '',
					member.phoneMobile || '',
				].join(';').replace(/\n/g, '').replace(/\r/g, '')
			);
		}

		res.contentType('text/csv');
		res.setHeader(
			'Content-Disposition',
			`inline; filename=Mitgliederliste ${moment(new Date()).format('DD-MM-YYYY')}.csv`
		);
		res.send(csv.join('\n'));
	}
}
