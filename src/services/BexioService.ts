import Bexio, { BillsStatic, ContactsStatic, OrdersStatic } from 'bexio';
import * as Express from 'express';
import ContactType from '../entities/ContactType';
import ContactGroup from '../entities/ContactGroup';
import Contact from '../entities/Contact';
import Order from '../entities/Order';
import Position from '../entities/Position';
import config from 'config';
import { getManager, In } from 'typeorm';
import yargs from 'yargs';
import Datacontainer from './DataContainer';
import moment = require('moment');
import OrderCompensation from '../entities/OrderCompensation';
import CustomCompensation from '../entities/CustomCompensation';
import Product from '../entities/Product';
import CronJobs from './CronJobs';

export namespace BexioService {
	let bexioAPI = new Bexio(config.get('bexio.token'));

	export function addCommandline(yargs: yargs.Argv): void {
		yargs.command({
			command: 'bexio',
			describe: 'Functions of the bexio service',
			builder: (yargs) => {
				return yargs.command({
					command: 'sync [force]',
					describe: 'Sync command',
					builder: (yargs) => {
						return yargs
							.command({
								command: 'contacts',
								builder: {
									force: {
										alias: 'f',
									},
								},
								handler: async () => {
									await BexioService.syncContacts();
									console.log('sync completed');
									process.exit(0);
								},
							})
							.command({
								command: 'contactGroups',
								builder: {
									force: {
										alias: 'f',
									},
								},
								handler: async () => {
									await BexioService.syncContactGroups();
									console.log('sync completed');
									process.exit(0);
								},
							})
							.command({
								command: 'contactTypes',
								builder: {
									force: {
										alias: 'f',
									},
								},
								handler: async () => {
									await BexioService.syncContactTypes();
									console.log('sync completed');
									process.exit(0);
								},
							})
							.command({
								command: 'orders',
								builder: {
									force: {
										alias: 'f',
									},
								},
								handler: async () => {
									await BexioService.syncOrders();
									console.log('sync completed');
									process.exit(0);
								},
							})
							.command({
								command: 'billStatuses',
								builder: {
									force: {
										alias: 'f',
									},
								},
								handler: async () => {
									await BexioService.syncBillStatuses();
									console.log('sync completed');
									process.exit(0);
								},
							})
							.command({
								command: 'products',
								handler: async () => {
									await BexioService.syncProducts();
									console.log('sync completed');
									process.exit(0);
								},
							});
					},
					handler: () => {},
				});
			},
			handler: () => {},
		});
	}

	export function addExpressHandlers(app: Express.Application): void {
		app.get('/bexio/sync/all', async (req, res) => {
			if (req.header('X-Azure')) res.send('started');
			if (req.header('X-Azure'))
				await Promise.all([BexioService.syncContactGroups(), BexioService.syncContactTypes()]);
			await Promise.all([
				BexioService.syncContacts(),
				BexioService.syncOrders(),
				BexioService.syncBillStatuses(),
				BexioService.syncProducts(),
			]);
		});

		app.get('/bexio/sync/contactTypes', async (req, res) => {
			if (req.header('X-Azure'))
				BexioService.syncContactTypes()
					.then(() => {
						res.send('Synced');
					})
					.catch(() => {
						res.send('Something went wrong!');
					});
		});

		app.get('/bexio/sync/contactGroups', async (req, res) => {
			if (req.header('X-Azure'))
				BexioService.syncContactGroups()
					.then(() => {
						res.send('Synced');
					})
					.catch(() => {
						res.send('Something went wrong!');
					});
		});

		app.get('/bexio/sync/contacts', async (req, res) => {
			if (req.header('X-Azure'))
				BexioService.syncContacts()
					.then(() => {
						res.send('Synced');
					})
					.catch(() => {
						res.send('Something went wrong!');
					});
		});

		app.get('/bexio/sync/orders', async (req, res) => {
			if (req.header('X-Azure'))
				BexioService.syncOrders()
					.then(() => {
						res.send('Synced');
					})
					.catch(() => {
						res.send('Something went wrong!');
					});
		});

		app.get('/bexio/sync/billStatuses', async (req, res) => {
			if (req.header('X-Azure'))
				BexioService.syncBillStatuses()
					.then(() => {
						res.send('Synced');
					})
					.catch(() => {
						res.send('Something went wrong!');
					});
		});

		app.get('/bexio/sync/products', async (req, res) => {
			if (req.header('X-Azure'))
				BexioService.syncProducts()
					.then(() => {
						res.send('Synced');
					})
					.catch(() => {
						res.send('Something went wrong!');
					});
		});
	}

	export async function regsiterCronJobs() {
		await CronJobs.register(BexioService.syncContactGroups, 30 * 60 * 1000);
		await CronJobs.register(BexioService.syncContactTypes, 30 * 60 * 1000);
		await CronJobs.register(BexioService.syncContacts, 30 * 60 * 1000);
		await CronJobs.register(BexioService.syncOrders, 30 * 60 * 1000);
		await CronJobs.register(BexioService.syncBillStatuses, 30 * 60 * 1000);
		await CronJobs.register(BexioService.syncProducts, 30 * 60 * 1000);
	}

	/**
	 * syncs active contacts as contacts
	 *
	 * @export
	 * @returns {Promise<void>}
	 */
	export async function syncContacts(): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			let contacts = await bexioAPI.contacts.search(
				[
					{
						field: ContactsStatic.ContactSearchParameters.updated_at,
						value: moment(
							Datacontainer.get<Date>('bexio.contacts.lastSync') || '1970-01-01'
						).format('Y-MM-DD hh:mm:ss'),
						criteria: '>=',
					},
				],
				{
					limit: 2000,
				}
			);
			let contactRepo = getManager().getRepository(Contact);
			let contactTypeRepo = getManager().getRepository(ContactType);
			let contactGroupRepo = getManager().getRepository(ContactGroup);
			let savePromises: Array<any> = [];

			console.log('syncing ' + contacts.length);
			for (let contact of contacts) {
				try {
					let contactType = await contactTypeRepo.findOne({ bexioId: contact.contact_type_id });
					let contactGroups: ContactGroup[] = [];
					if (contact.contact_group_ids) {
						contactGroups = await contactGroupRepo.find({
							bexioId: In<number>(
								contact.contact_group_ids
									.split(',')
									.map((id) => parseInt(id))
									.filter((id) => !isNaN(id))
							),
						});
					}

					let contactDB = await contactRepo.findOne({ bexioId: contact.id });
					const extendedContact = await bexioAPI.contacts.show(contact.id);

					if (!contactDB) contactDB = new Contact();
					contactDB = Object.assign(contactDB, {
						bexioId: contact.id,
						nr: contact.nr,
						contactType: contactType,
						firstname: contact.name_2 || '',
						lastname: contact.name_1 || '',
						birthday: new Date(<string>contact.birthday),
						address: contact.address || '',
						postcode: contact.postcode || '',
						city: contact.city || '',
						mail: contact.mail || '',
						mailSecond: contact.mail_second,
						phoneFixed: contact.phone_fixed,
						phoneFixedSecond: contact.phone_fixed_second,
						phoneMobile: contact.phone_mobile,
						remarks: contact.remarks,
						contactGroups: contactGroups,
						ownerId: contact.owner_id,
						profilePicture: extendedContact.profile_image,
					});

					savePromises.push(
						contactDB.save().catch((err) => {
							console.error(err);
							return Promise.resolve();
						})
					);

					console.log('synced contact ' + savePromises.length);
				} catch (err) {
					console.error(err);
				}
			}

			Promise.all(savePromises)
				.then(() => {
					Datacontainer.set('bexio.contacts.lastSync', new Date());
					resolve();
				})
				.catch((err) => {
					console.error(err);
					reject();
				});
		});
	}

	/**
	 * Syncs the contact groups and updates if needed
	 *
	 * @export
	 * @returns {Promise<void>}
	 */
	export async function syncContactGroups(): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			let groups = await bexioAPI.contactGroups.list({});
			let contactGroupRepo = getManager().getRepository(ContactGroup);
			let savePromises: Array<any> = [];

			for (let group of groups) {
				let groupDB = await contactGroupRepo.findOne({ bexioId: group.id });
				if (!groupDB) groupDB = new ContactGroup();
				groupDB.bexioId = group.id;
				groupDB.name = group.name;

				savePromises.push(groupDB.save());
			}

			Promise.all(savePromises)
				.then(() => {
					resolve();
				})
				.catch((err) => {
					console.error(err);
					reject();
				});
		});
	}

	/**
	 * Syncs the contact types and updates if needed
	 *
	 * @export
	 * @returns {Promise<void>}
	 */
	export async function syncContactTypes(): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			let types = await bexioAPI.contactTypes.list({});
			let contactTypeRepo = getManager().getRepository(ContactType);
			let savePromises: Array<any> = [];

			for (let type of types) {
				let typeDB = await contactTypeRepo.findOne({ bexioId: type.id });
				if (!typeDB) typeDB = new ContactType();
				typeDB.bexioId = type.id;
				typeDB.name = type.name;

				savePromises.push(typeDB.save());
			}

			Promise.all(savePromises)
				.then(() => {
					resolve();
				})
				.catch((err) => {
					console.error(err);
					reject();
				});
		});
	}

	/**
	 * syncs all order and their positions
	 *
	 * @export
	 * @returns {Promise<void>}
	 */
	export async function syncOrders(): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			let orders = await bexioAPI.orders.search([
				{
					field: OrdersStatic.OrderSearchParameters.updated_at,
					value: moment(Datacontainer.get<Date>('bexio.orders.lastSync') || '1970-01-01').format(
						'Y-MM-DD hh:mm:ss'
					),
					criteria: '>=',
				},
			]);
			let contactRepo = getManager().getRepository(Contact);
			let savePromises: Array<any> = [];

			console.log('Syncing ' + orders.length);
			for (let order of orders) {
				let bexioOrder = await bexioAPI.orders.show(order.id);
				if (bexioOrder) {
					let contact = await contactRepo.findOne({ bexioId: bexioOrder.contact_id });

					savePromises.push(
						getManager().transaction(async (transaction) => {
							return new Promise<void>(async (resolve, reject) => {
								let orderRepo = transaction.getRepository(Order);
								let orderDB = await orderRepo.findOne({ bexioId: bexioOrder.id });
								if (!orderDB) orderDB = new Order();
								orderDB = Object.assign(orderDB, {
									bexioId: bexioOrder.id,
									documentNr: bexioOrder.document_nr,
									validFrom: new Date(bexioOrder.is_valid_from),
									title: bexioOrder.title,
									contact: contact,
									total: parseFloat(bexioOrder.total) ? parseFloat(bexioOrder.total) : 0,
									deliveryAddress: bexioOrder.delivery_address,
									positions: [],
								});

								orderDB = await orderDB.save();
								//first sync all positions
								let positionPromises = [];
								if (bexioOrder.positions) {
									let positionRepo = transaction.getRepository(Position);
									for (let position of bexioOrder.positions) {
										let positionDB = await positionRepo.findOne({ bexioId: position.id });
										if (!positionDB) positionDB = new Position();
										positionDB = Object.assign(positionDB, {
											bexioId: position.id,
											positionType: position.type,
											text: position.text,
											pos: position.pos,
											internalPos: position.internal_pos,
											articleId: position.article_id,
											orderBexioId: bexioOrder.id,
											positionTotal: parseFloat(position.position_total)
												? parseFloat(position.position_total)
												: null,
											order: orderDB,
										});
										positionPromises.push(positionDB.save());
									}
								}

								Promise.all(positionPromises).then(async (positions) => {
									if (orderDB) {
										orderDB.positions = positions;
										await orderDB.save();

										console.log('Synced order ' + savePromises.length);
										Datacontainer.set('bexio.orders.lastSync', new Date());
										resolve();
									}
								});
							});
						})
					);
				}
			}

			Promise.all(savePromises)
				.then(() => {
					resolve();
				})
				.catch((err) => {
					console.error(err);
					reject();
				});
		});
	}

	export async function syncBillStatuses(): Promise<void> {
		const ocQB = getManager().getRepository(OrderCompensation).createQueryBuilder('Compensation');
		const ccQB = getManager().getRepository(CustomCompensation).createQueryBuilder('Compensation');

		const orderCompensations: Array<{ bexioBill: number }> = await ocQB
			.select('DISTINCT bexioBill', 'bexioBill')
			.where('bexioBill IS NOT NULL')
			.execute();

		const customCompensations: Array<{ bexioBill: number }> = await ccQB
			.select('DISTINCT bexioBill', 'bexioBill')
			.where('bexioBill IS NOT NULL')
			.execute();

		const allBills = orderCompensations.concat(customCompensations);
		allBills.filter((val, index) => allBills.indexOf(val) === index);
		const allBillsIds = allBills.map((el) => el.bexioBill);

		for (const id of allBillsIds) {
			console.log(`syncing bexio bill ${id}`);
			const bill = await bexioAPI.bills.show(id);
			if (parseFloat(bill.total_remaining_payments) == 0) {
				await ocQB
					.update()
					.set({ paied: true })
					.where('bexioBill = :bexioBillId', { bexioBillId: id })
					.execute();
				await ccQB
					.update()
					.set({ paied: true })
					.where('bexioBill = :bexioBillId', { bexioBillId: id })
					.execute();
			} else {
				await ocQB
					.update()
					.set({ paied: false })
					.where('bexioBill = :bexioBillId', { bexioBillId: id })
					.execute();
				await ccQB
					.update()
					.set({ paied: false })
					.where('bexioBill = :bexioBillId', { bexioBillId: id })
					.execute();
			}
		}
	}

	export async function syncProducts(): Promise<void> {
		const productRepo = getManager().getRepository(Product);
		const contactRepo = getManager().getRepository(Contact);
		const allItems = await bexioAPI.items.list({
			limit: 2000,
		});
		const savePromises = [];
		console.log(`syncing ${allItems.length} products`);
		for (const item of allItems) {
			let product = await productRepo.findOne({ bexioId: item.id });
			if (!product) {
				product = new Product();
			}

			let contact: Contact | undefined;
			if (item.contact_id) {
				contact = await contactRepo.findOne({ bexioId: item.contact_id });
			}

			product = Object.assign(product, {
				contact: contact,
				bexioId: item.id,
				articleType: item.article_type_id,
				delivererCode: item.deliverer_code,
				delivererDescription: item.deliverer_description,
				internCode: item.intern_code,
				internName: item.intern_name,
				internDescription: item.intern_description,
				purchasePrice: item.purchase_price,
				salePrice: item.sale_price,
				purchaseTotal: item.purchase_total,
				saleTotal: item.sale_total,
				remarks: item.remarks,
				deliveryPrice: item.delivery_price,
				articleGroupId: item.article_group_id,
			});
			savePromises.push(product.save());
			savePromises[savePromises.length - 1].then((p) => {
				console.log(`Synced product ${p.id}`);
			});
		}

		await Promise.all(savePromises);
	}

	export async function createBill(
		positions: Array<BillsStatic.CustomPositionCreate | BillsStatic.ArticlePositionCreate>,
		member: Contact,
		mwst: boolean = true,
		termsOfPaymentText: string = '',
		title: string = '',
		issue: boolean = false
	): Promise<BillsStatic.BillFull> {
		let bill: BillsStatic.BillCreate = {
			contact_id: member.bexioId,
			user_id: 3, // user of Mathias Scherer
			terms_of_payment_text: termsOfPaymentText,
			contact_address_manual: `${member.address}, ${member.postcode} ${member.city}`,
			mwst_type: mwst ? 0 : 1,
			positions,
			title,
		};

		const fullBill = await bexioAPI.bills.create(bill);
		if (issue) {
			await bexioAPI.bills.issue(fullBill.id);
		}
		return fullBill;
	}
}
