import Bexio, { Scopes } from 'bexio';
import * as Express from 'express'
import ContactType from '../entities/ContactType';
import ContactGroup from '../entities/ContactGroup';
import Contact from '../entities/Contact';
import Order from '../entities/Order';
import Position from '../entities/Position';
import config from 'config'
import { getManager, In } from 'typeorm';

export namespace BexioService {
    let bexioAPI = new Bexio('6317446720.apps.bexio.com', 'Q5+mns0qH/vgB8/Q9phFV9cjpCU=', config.get('apiEndpoint') + '/bexio/callback', [Scopes.CONTACT_SHOW, Scopes.KB_ORDER_SHOW])

    export function isInitialized(): boolean {
        return bexioAPI.isInitialized()
    }

    export function addExpressHandlers(app: Express.Application): void {
        app.get('/bexio/init', async (req: Express.Request, res: Express.Response) => {
            if (!bexioAPI.isInitialized()) {
                res.redirect(bexioAPI.getAuthUrl())
            } else {
                res.send('Done')
            }
        })

        app.get('/bexio/callback', async (req, res) => {
            await bexioAPI.generateAccessToken(req.query)
            console.log('Got callback')
            res.send('Done')
        })

        app.get('/bexio/fakelogin', async (req, res) => {
            await bexioAPI.fakeLogin('mathias.scherer@vkazu.ch', 'z98u!uGUd%%k')
            res.send('Done')
        })

        app.get('/bexio/initialized', async (req, res) => {
            if (!bexioAPI.isInitialized()) {
                res.send('Nop')
            } else {
                res.send('Jep')
            }
        })

        app.get('/bexio/sync/contactTypes', (req, res) => {
            BexioService.syncContactTypes().then(() => {
                res.send('Synced')
            }).catch(() => {
                res.send('Something went wrong!')
            })
        })

        app.get('/bexio/sync/contactGroups', (req, res) => {
            BexioService.syncContactGroups().then(() => {
                res.send('Synced')
            }).catch(() => {
                res.send('Something went wrong!')
            })
        })

        app.get('/bexio/sync/contacts', (req, res) => {
            BexioService.syncContacts().then(() => {
                res.send('Synced')
            }).catch(() => {
                res.send('Something went wrong!')
            })
        })

        app.get('/bexio/sync/orders', (req, res) => {
            BexioService.syncOrders().then(() => {
                res.send('Synced')
            }).catch(() => {
                res.send('Something went wrong!')
            })
        })
    }

    export function getAuthUrl(): string {
        return bexioAPI.getAuthUrl()
    }

    /**
     * syncs active contacts as contacts
     *
     * @export
     * @returns {Promise<void>}
     */
    export async function syncContacts(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            let contacts = await bexioAPI.contacts.list({})
            let contactRepo = getManager().getRepository(Contact)
            let contactTypeRepo = getManager().getRepository(ContactType)
            let contactGroupRepo = getManager().getRepository(ContactGroup)
            let savePromises: Array<any> = []

            console.log('syncing ' + contacts.length)
            for (let contact of contacts) {
                let contactType = await contactTypeRepo.findOne({ bexioId: contact.contact_type_id })
                let contactGroups = await contactGroupRepo.find({ bexioId: In((contact.contact_group_ids || '').split(',')) })
                let contactDB = await contactRepo.findOne({ bexioId: contact.id })

                if (!contactDB) contactDB = new Contact()
                contactDB = Object.assign(contactDB, {
                    bexioId: contact.id,
                    nr: contact.nr,
                    contactType: contactType,
                    firstname: contact.name_2,
                    lastname: contact.name_1,
                    birthday: new Date(<string>contact.birthday),
                    address: contact.address,
                    postcode: contact.postcode,
                    city: contact.city,
                    mail: contact.mail,
                    mailSecond: contact.mail_second,
                    phoneFixed: contact.phone_fixed,
                    phoneFixedSecond: contact.phone_fixed_second,
                    phoneMobile: contact.phone_mobile,
                    remarks: contact.remarks,
                    contactGroups: contactGroups,
                    ownerId: contact.owner_id
                })

                savePromises.push(contactRepo.save(contactDB))

                console.log('synced ' + savePromises.length)
            }

            Promise.all(savePromises).then(() => {
                resolve()
            }).catch((err) => {
                console.error(err)
                reject()
            })
        })
    }

    /**
     * Syncs the contact groups and updates if needed
     *
     * @export
     * @returns {Promise<void>}
     */
    export async function syncContactGroups(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            let groups = await bexioAPI.contactGroups.list({})
            let contactGroupRepo = getManager().getRepository(ContactGroup)
            let savePromises: Array<any> = []

            for (let group of groups) {
                let groupDB = await contactGroupRepo.findOne({ bexioId: group.id })
                if (!groupDB) groupDB = new ContactGroup()
                groupDB.bexioId = group.id
                groupDB.name = group.name

                savePromises.push(contactGroupRepo.save(groupDB))
            }

            Promise.all(savePromises).then(() => {
                resolve()
            }).catch((err) => {
                console.error(err)
                reject()
            })
        })
    }

    /**
     * Syncs the contact types and updates if needed
     *
     * @export
     * @returns {Promise<void>}
     */
    export async function syncContactTypes(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            let types = await bexioAPI.contactTypes.list({})
            let contactTypeRepo = getManager().getRepository(ContactType)
            let savePromises: Array<any> = []

            for (let type of types) {
                let typeDB = await contactTypeRepo.findOne({ bexioId: type.id })
                if (!typeDB) typeDB = new ContactType()
                typeDB.bexioId = type.id
                typeDB.name = type.name

                savePromises.push(contactTypeRepo.save(typeDB))
            }

            Promise.all(savePromises).then(() => {
                resolve()
            }).catch((err) => {
                console.error(err)
                reject()
            })
        })
    }

    /**
     * syncs all order and their positions
     *
     * @export
     * @returns {Promise<void>}
     */
    export async function syncOrders(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            let orders = await bexioAPI.orders.list({})
            let contactRepo = getManager().getRepository(Contact)
            let savePromises: Array<any> = []

            console.log('Syncing ' + orders.length)
            for (let order of orders) {
                let bexioOrder = await bexioAPI.orders.show({}, order.id.toString())
                if (bexioOrder) {
                    let contact = await contactRepo.findOne({ bexioId: bexioOrder.contact_id })

                    savePromises.push(getManager().transaction(async transaction => {
                        return new Promise<void>(async (resolve, reject) => {
                            let orderRepo = transaction.getRepository(Order)
                            let orderDB = await orderRepo.findOne({ bexioId: bexioOrder.id })
                            if (!orderDB) orderDB = new Order()
                            orderDB = Object.assign(orderDB, {
                                bexioId: bexioOrder.id,
                                documentNr: bexioOrder.document_nr,
                                validFrom: new Date(bexioOrder.is_valid_from),
                                title: bexioOrder.title,
                                contact: contact,
                                total: (parseFloat(bexioOrder.total)) ? parseFloat(bexioOrder.total) : 0,
                                deliveryAddress: bexioOrder.delivery_address,
                                positions: [],
                            })

                            await orderRepo.save(orderDB)

                            //first sync all positions 
                            let positionPromises = []
                            if (bexioOrder.positions) {
                                let positionRepo = transaction.getRepository(Position)
                                for (let position of bexioOrder.positions) {
                                    let positionDB = await positionRepo.findOne({ bexioId: position.id })
                                    if (!positionDB) positionDB = new Position()
                                    positionDB = Object.assign(positionDB, {
                                        bexioId: position.id,
                                        positionType: position.type,
                                        text: position.text,
                                        pos: position.pos,
                                        internalPos: position.internal_pos,
                                        articleId: position.article_id,
                                        orderBexioId: bexioOrder.id,
                                        positionTotal: (parseFloat(position.position_total)) ? parseFloat(position.position_total) : null,
                                        order: orderDB
                                    })
                                    positionPromises.push(positionRepo.save(positionDB))
                                }
                            }

                            Promise.all(positionPromises).then(async (positions) => {
                                if (orderDB) {
                                    orderDB.positions = positions
                                    await orderRepo.save(orderDB)

                                    console.log('Synced ' + savePromises.length)
                                    resolve()
                                }
                            })
                        })
                    }))
                }
            }

            Promise.all(savePromises).then(() => {
                resolve()
            }).catch((err) => {
                console.error(err)
                reject()
            })
        })
    }
}