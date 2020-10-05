import * as Express from 'express';
import { getManager } from 'typeorm';
import MaterialChangelog from '../entities/MaterialChangelog';
import moment from 'moment';
import PdfService from '../services/PdfService';

export default class MaterialChangelogController {
	public static async getReceipt(req: Express.Request, res: Express.Response): Promise<void> {
		const changelogId = req.params.id;
		const changelog = await getManager()
			.getRepository(MaterialChangelog)
			.findOne(changelogId, {
				relations: [
					'changes',
					'changes.product',
					'inContact',
					'outContact',
					'inWarehouse',
					'outWarehouse',
					'creator'
				],
			});

		if (!changelog) {
			res.status(404);
			res.send({ message: 'MaterialChangelog not found' });
			return;
		}

		res.contentType('application/pdf');
		res.setHeader(
			'Content-Disposition',
			`inline; filename=Materialquittung ${moment(changelog.date).format('DD-MM-YYYY')}.pdf`
		);
		res.send(await PdfService.generateMaterialChangelogReceipe(changelog));
	}
}
