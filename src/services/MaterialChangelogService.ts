import MaterialChangelog from '../entities/MaterialChangelog';
import fs from 'fs';
import path from 'path';
import sass from 'node-sass';
import pug from 'pug';
import moment from 'moment';
import { getManager } from 'typeorm'
import ContactExtension from '../entities/ContactExtension'
import EMailService from './EMailService'
import PdfService from './PdfService'
import config from 'config'

export default class MaterialChangelogService {
    private static emailService = new EMailService('no-reply@vkazu.ch');

	public static async sendReceiptMail(changelog: MaterialChangelog): Promise<boolean> {
		const pdf = await PdfService.generateMaterialChangelogReceipe(changelog);
		const email = await MaterialChangelogService.generateReceiptMail(changelog);
		let addresses: string[] = [];
		if (changelog.inContact) {
			addresses.push(changelog.inContact.mail);
			if (changelog.inContact.mailSecond) {
				addresses.push(changelog.inContact.mailSecond);
			}
			const extension = await getManager()
				.getRepository(ContactExtension)
				.findOne({ where: { contact: changelog.inContact.id } });
			if (extension && extension.moreMails) {
				addresses = addresses.concat(extension.moreMails);
			}
		}
		if (changelog.outContact) {
			addresses = [];
			addresses.push(changelog.outContact.mail);
			if (changelog.outContact.mailSecond) {
				addresses.push(changelog.outContact.mailSecond);
			}
			const extension = await getManager()
				.getRepository(ContactExtension)
				.findOne({ where: { contact: changelog.outContact.id } });
			if (extension && extension.moreMails) {
				addresses = addresses.concat(extension.moreMails);
			}
		}

		await MaterialChangelogService.emailService.sendMail(
			addresses,
			'no-reply@vkazu.ch',
			`Materialquittung vom ${moment(changelog.createdAt).format('DD.MM.YYYY')}`,
			email,
			[
				{
					filename: `Materialquittung ${moment(changelog.createdAt).format('DD.MM.YYYY')}.pdf`,
					content: pdf,
				},
			]
		);

		return true;
	}

	public static async generateReceiptMail(changelog: MaterialChangelog): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			fs.readFile(path.resolve(__dirname, '../../public/logo.png'), async (err, data) => {
				if (err) {
					reject(err);
					return;
				}

				resolve(
					pug.renderFile(
						path.resolve(
							__dirname,
							'../../public/emails/materialChangelog/materialChangelogReceipt.pug'
						),
						{
                            apiEndpoint: config.get('apiEndpoint'),
							compiledStyle: sass.renderSync({
								file: path.resolve(
									__dirname,
									'../../public/emails/materialChangelog/materialChangelogReceipt.scss'
								),
							}).css,
							date: moment(changelog.createdAt).format('DD.MM.YYYY'),
							contact: changelog.inContact || changelog.outContact,
						}
					)
				);
			});
		});
	}
}
