import moment from 'moment';
import BillingReport from '../entities/BillingReport';
import EMailService from './EMailService';
import PdfService from './PdfService';
import fs from 'fs';
import path from 'path';
import sass from 'node-sass';
import pug from 'pug';
import config from 'config';
import * as Express from 'express';
import { getManager } from 'typeorm';

export default class BillingReportService {
	private static emailService = new EMailService('no-reply@vkazu.ch');

	public static async sendReceiptMail(billingReport: BillingReport): Promise<boolean> {
		const pdf = await PdfService.generateBillingReportReceipt(billingReport);
		const email = await BillingReportService.generateReceiptMail(billingReport);

		let mails: string[] = [];
		if (billingReport.order.contact?.mail) {
			mails.push(billingReport.order.contact?.mail);
		}
		if (billingReport.order.contact?.mailSecond) {
			mails.push(billingReport.order.contact?.mailSecond);
		}

		if (mails.length === 0) {
			return false;
		}
		console.log(mails);

		await BillingReportService.emailService.sendMail(
			mails,
			'no-reply@vkazu.ch',
			`Einsatzrapport vom ${moment(billingReport.date).format('DD.MM.YYYY')}`,
			email,
			[
				{
					filename: `Einsatzrapport vom ${moment(billingReport.date).format('DD-MM-YYYY')}.pdf`,
					content: pdf,
				},
			]
		);
		return true;
	}

	public static generateReceiptMail(billingReport: BillingReport): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			fs.readFile(path.resolve(__dirname, '../../public/logo.png'), async (err, data) => {
				if (err) {
					reject(err);
					return;
				}

				resolve(
					pug.renderFile(
						path.resolve(__dirname, '../../public/emails/billingReport/billingReportReceipt.pug'),
						{
							apiEndpoint: config.get('apiEndpoint'),
							compiledStyle: sass.renderSync({
								file: path.resolve(
									__dirname,
									'../../public/emails/billingReport/billingReportReceipt.scss'
								),
							}).css,
							date: moment(billingReport.date).format('DD.MM.YYYY'),
						}
					)
				);
			});
		});
	}

	public static async getReceipt(req: Express.Request, res: Express.Response): Promise<void> {
		const billingReportId = req.params.id;
		const billingReport = await getManager()
			.getRepository(BillingReport)
			.findOne(billingReportId, {
				relations: ['order', 'compensations', 'els'],
			});

		if (!billingReport) {
			res.status(404);
			res.send({ message: 'BillingReport not found' });
			return;
		}

		res.contentType('application/pdf');
		res.setHeader(
			'Content-Disposition',
			`inline; filename=Materialquittung ${moment(billingReport.date).format('DD-MM-YYYY')}.pdf`
		);
		res.send(await PdfService.generateBillingReportReceipt(billingReport));
	}
}
