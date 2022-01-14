import * as Express from 'express';
import { getManager } from 'typeorm';
import moment from 'moment';
import PdfService from '../services/PdfService';
import Warehouse from '../entities/Warehouse';
import MaterialChangelogService, { StockEntry } from '../services/MaterialChangelogService';
import { MaterialChangelog2ContactView } from '../entities/MaterialChangelog2ContactView';
import Contact from '../entities/Contact';
import ContactGroup from '../entities/ContactGroup';

export default class WarehouseController {
	public static async getTotalReport(req: Express.Request, res: Express.Response): Promise<void> {
		const warehouses = await getManager().getRepository(Warehouse).find({});

		let allEntries: Array<StockEntry> = [];

		for (const warehouse of warehouses) {
			const entries = await MaterialChangelogService.getWarehouseStock(warehouse.id);
			allEntries = allEntries.concat(entries);
		}

		let stock = await getManager()
			.getRepository(MaterialChangelog2ContactView)
			.createQueryBuilder()
			.select('sum(inAmount) as inAmount')
			.addSelect('sum(outAmount) as outAmount')
			.leftJoinAndSelect(
				'product',
				'product',
				'product.id = MaterialChangelog2ContactView.productId'
			)
			.leftJoin('contact', 'contact', 'contact.id = MaterialChangelog2ContactView.contactId')
			.leftJoin('contact.contactGroups', 'contact_group')
			.groupBy('MaterialChangelog2ContactView.productId')
			.where('contact_group.bexioId = :bexioId', { bexioId: 7 })
			.orderBy('product.internName')
			.getRawMany();

		allEntries = allEntries.concat(
			stock.map((stock) => ({
				productName: stock.product_internName,
				amount: stock.inAmount - stock.outAmount,
				location: 'Mitglieder',
			}))
		);

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
			.leftJoin('contact', 'contact', 'contact.id = MaterialChangelog2ContactView.contactId')
			.where('contact.bexioId = :bexioId', { bexioId: 1321 })
			.orderBy('product.internName')
			.getRawMany();

		allEntries = allEntries.concat(
			stock
				.map((stock) => ({
					productName: stock.product_internName,
					amount: (stock.outAmount - stock.inAmount) * -1,
					location: 'Unbekannt',
				}))
				.filter((e) => e.amount > 0)
		);

		allEntries.sort((a, b) => {
			if (a.location < b.location) {
				return -1;
			}
			if (a.location > b.location) {
				return 1;
			}
			return 0;
		});

		res.contentType('application/pdf');
		res.setHeader(
			'Content-Disposition',
			`inline; filename=Lagerreport ${moment(new Date()).format('DD-MM-YYYY')}.pdf`
		);
		res.send(await PdfService.generateWarehousesReport(allEntries.filter((e) => e.amount != 0)));
	}

	public static async getReport(req: Express.Request, res: Express.Response): Promise<void> {
		const warehouse = await getManager().getRepository(Warehouse).findOne(req.params.id);

		if (!warehouse) {
			res.status(404);
			res.send({ message: 'Warehouse not found' });
			return;
		}

		const stock = await MaterialChangelogService.getWarehouseStock(warehouse.id);
		res.contentType('application/pdf');
		res.setHeader(
			'Content-Disposition',
			`inline; filename=Lagerreport ${warehouse.name} ${moment(new Date()).format(
				'DD-MM-YYYY'
			)}.pdf`
		);
		res.send(
			await PdfService.generateWarehouseReport(
				warehouse,
				stock.filter((e) => e.amount != 0)
			)
		);
	}
}
