import MaterialChangelog from '../entities/MaterialChangelog';
import fs from 'fs';
import path from 'path';
import sass from 'node-sass';
import pug from 'pug';
import moment from 'moment';
import { getManager } from 'typeorm';
import ContactExtension from '../entities/ContactExtension';
import EMailService from './EMailService';
import PdfService from './PdfService';
import config from 'config';
import MaterialChangelogToProduct from '../entities/MaterialChangelogToProduct';

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
			`Materialquittung vom ${moment(changelog.date).format('DD.MM.YYYY')}`,
			email,
			[
				{
					filename: `Materialquittung ${moment(changelog.date).format('DD.MM.YYYY')}.pdf`,
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
							date: moment(changelog.date).format('DD.MM.YYYY'),
							contact: changelog.inContact || changelog.outContact,
						}
					)
				);
			});
		});
	}

	public static async getContactStock(id: number): Promise<MaterialChangelogToProduct[]> {
		const inChanges = await getManager()
			.getRepository(MaterialChangelogToProduct)
			.createQueryBuilder('mc2p')
			.leftJoin('mc2p.changelog', 'mc')
			.leftJoin('mc2p.product', 'product')
			.where('mc.inContactId = :contactId', { contactId: id })
			.andWhere('mc.deletedBy is NULL')
			.getMany();
		const outChanges = await getManager()
			.getRepository(MaterialChangelogToProduct)
			.createQueryBuilder('mc2p')
			.leftJoin('mc2p.changelog', 'mc')
			.leftJoin('mc2p.product', 'product')
			.where('mc.outContactId = :outContactId', { outContactId: id })
			.andWhere('mc.deletedBy is NULL')
			.getMany();

		return this.aggregateChanges(inChanges, outChanges);
	}

	public static async getWarehouseStock(id: number): Promise<MaterialChangelogToProduct[]> {
		const inChanges = await getManager()
			.getRepository(MaterialChangelogToProduct)
			.createQueryBuilder('mc2p')
			.leftJoin('mc2p.changelog', 'mc')
			.leftJoinAndSelect('mc2p.product', 'product')
			.where('mc.inWarehouseId = :warehouseId', { warehouseId: id })
			.andWhere('mc.deletedBy is NULL')
			.getMany();
		const outChanges = await getManager()
			.getRepository(MaterialChangelogToProduct)
			.createQueryBuilder('mc2p')
			.leftJoin('mc2p.changelog', 'mc')
			.leftJoinAndSelect('mc2p.product', 'product')
			.where('mc.outWarehouseId = :warehouseId', { warehouseId: id })
			.andWhere('mc.deletedBy is NULL')
			.getMany();

		return this.aggregateChanges(inChanges, outChanges);
	}

	private static aggregateChanges(
		inChanges: MaterialChangelogToProduct[],
		outChanges: MaterialChangelogToProduct[]
	): MaterialChangelogToProduct[] {
		const aggregated: MaterialChangelogToProduct[] = [];

		for (const change of inChanges) {
			const index = aggregated.findIndex(
				(c) => c.productId === change.productId && c.number === change.number
			);
			if (index === -1) {
				aggregated.push(change);
			} else {
				aggregated[index].amount = aggregated[index].amount + change.amount;
			}
		}

		for (const change of outChanges) {
			const index = aggregated.findIndex(
				(c) => c.productId === change.productId && c.number === change.number
			);
			if (index === -1) {
				const indexWithoutNumber = aggregated.findIndex(
					(c) => c.productId === change.productId && !c.number
				);
				if (indexWithoutNumber > -1) {
					aggregated[indexWithoutNumber].amount = aggregated[indexWithoutNumber].amount - change.amount;
				} else {
					change.amount = change.amount * -1;
					aggregated.push(change);
				}
			} else {
				aggregated[index].amount = aggregated[index].amount - change.amount;
			}
		}

		return aggregated.filter((c) => c.amount !== 0);
	}
}
