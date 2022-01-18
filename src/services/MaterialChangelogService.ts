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
import { MaterialChangelog2WarehouseView } from '../entities/MaterialChangelog2WarehouseView';
import { Field, ObjectType } from 'type-graphql';
import { MaterialChangelog2ContactView } from '../entities/MaterialChangelog2ContactView';

@ObjectType()
export class StockEntry {
	@Field()
	public productName: string;

	@Field()
	public amount: number;

	@Field()
	public location: string;
}

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

	public static async getWarehouseStock(warehouseId: number): Promise<StockEntry[]> {
		let stock = await getManager()
			.getRepository(MaterialChangelog2WarehouseView)
			.createQueryBuilder()
			.select('inAmount')
			.addSelect('outAmount')
			.leftJoinAndSelect(
				'product',
				'product',
				'product.id = MaterialChangelog2WarehouseView.productId'
			)
			.leftJoinAndSelect(
				'warehouse',
				'warehouse',
				'warehouse.id = MaterialChangelog2WarehouseView.warehouseId'
			)
			.where('warehouseId = :warehouseId', { warehouseId: warehouseId })
			.groupBy('productId')
			.orderBy('product.internName')
			.getRawMany();

		return stock.map((stock) => ({
			productName: stock.product_internName,
			amount: stock.inAmount - stock.outAmount,
			location: stock.warehouse_name,
		}));
	}

	public static async getProductLocation(productId: number): Promise<StockEntry[]> {
		let stock = await getManager()
			.getRepository(MaterialChangelog2WarehouseView)
			.createQueryBuilder()
			.select('inAmount')
			.addSelect('outAmount')
			.leftJoinAndSelect(
				'product',
				'product',
				'product.id = MaterialChangelog2WarehouseView.productId'
			)
			.leftJoinAndSelect(
				'warehouse',
				'warehouse',
				'warehouse.id = MaterialChangelog2WarehouseView.warehouseId'
			)
			.where('productId = :productId', { productId: productId })
			.groupBy('warehouseId')
			.orderBy('warehouse.name')
			.getRawMany();

		let aggregated = stock.map((stock) => ({
			productName: stock.product_internName,
			amount: stock.inAmount - stock.outAmount,
			location: stock.warehouse_name,
		}));

		stock = await getManager()
			.getRepository(MaterialChangelog2ContactView)
			.createQueryBuilder()
			.select('inAmount')
			.addSelect('outAmount')
			.leftJoinAndSelect(
				'product',
				'product',
				'product.id = MaterialChangelog2ContactView.productId'
			)
			.leftJoinAndSelect(
				'contact',
				'contact',
				'contact.id = MaterialChangelog2ContactView.contactId'
			)
			.where('productId = :productId', { productId: productId })
			.orderBy('contact.firstname')
			.getRawMany();

		return aggregated
			.concat(
				stock.map((stock) => ({
					productName: stock.product_internName,
					amount: stock.inAmount - stock.outAmount,
					location: `${stock.contact_firstname} ${stock.contact_lastname}`,
				}))
			)
			.filter((stock) => stock.amount != 0);
	}

	public static async getProductChangelogs(productId: number): Promise<MaterialChangelog[]> {
		return getManager()
			.getRepository(MaterialChangelog)
			.createQueryBuilder('changelog')
			.leftJoin('MaterialChangelogToProduct', 'toProduct', 'toProduct.changelogId = changelog.id')
			.where('toProduct.productId = :productId', { productId: productId })
			.orderBy('changelog.date', 'DESC')
			.getMany();
	}
}
