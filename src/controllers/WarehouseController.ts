import * as Express from 'express';
import { getManager } from 'typeorm';
import moment from 'moment';
import PdfService from '../services/PdfService';
import Warehouse from '../entities/Warehouse';
import MaterialChangelogService from '../services/MaterialChangelogService';
import MaterialChangelogToProduct from '../entities/MaterialChangelogToProduct';

export default class WarehouseController {
	public static async getTotalReport(req: Express.Request, res: Express.Response): Promise<void> {
		const warehouses = await getManager().getRepository(Warehouse).find({});

		let allEntries: Array<
			MaterialChangelogToProduct & { numbers: string; warehouse?: string }
		> = [];
		for (const warehouse of warehouses) {
			const stock = await MaterialChangelogService.getWarehouseStock(warehouse.id);
			const aggregated: Array<
				MaterialChangelogToProduct & { numbers: string; warehouse?: string }
			> = WarehouseController.aggregate(stock);
			aggregated.forEach((e) => {
				e.warehouse = warehouse.name;
			});
			allEntries = allEntries.concat(aggregated);
		}
		res.contentType('application/pdf');
		res.setHeader(
			'Content-Disposition',
			`inline; filename=Lagerreport ${moment(new Date()).format('DD-MM-YYYY')}.pdf`
		);
		res.send(await PdfService.generateWarehousesReport(allEntries));
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
			await PdfService.generateWarehouseReport(warehouse, WarehouseController.aggregate(stock))
		);
	}

	private static aggregate(
		stock: MaterialChangelogToProduct[]
	): Array<MaterialChangelogToProduct & { numbers: string }> {
		const aggregated: Array<MaterialChangelogToProduct & { numbers: string }> = [];
		for (const entry of stock) {
			const foundIndex = aggregated.findIndex((e) => e.product.id === entry.product.id);
			if (foundIndex > -1) {
				aggregated[foundIndex].amount += entry.amount;
				if (entry.number) {
					aggregated[foundIndex].numbers += `${
						(aggregated[foundIndex].numbers || '').length > 0 ? ',' : ''
					}${entry.number}`;
				}
			} else {
				const e = JSON.parse(JSON.stringify(entry));
				e.numbers = (e.number || '').toString();
				aggregated.push(e);
			}
		}
		return aggregated;
	}
}
