import Bexio, { Scopes } from 'bexio';
import * as Express from 'express'
import ContactType from '../entities/ContactType';
import ContactGroup from '../entities/ContactGroup';
import Contact from '../entities/Contact';
import Order from '../entities/Order';
import Position from '../entities/Position';
import config from 'config'

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
            res.send('Done')
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
            let savePromises: Array<any> = []

            console.log('syncing ' + contacts.length)
            for (let contact of contacts) {
                let contactType = await ContactType.findOne({ bexioId: contact.contact_type_id })
                let contactGroups = await ContactGroup.find({ bexioId: { $in: (contact.contact_group_ids || '').split(',') } })
                savePromises.push(Contact.updateOne({ bexioId: contact.id }, {
                    bexioId: contact.id,
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
                    userId: contact.user_id,
                    ownerId: contact.owner_id
                }, { upsert: true }))

                console.log('synced ' + savePromises.length)
            }

            Promise.all(savePromises).then(() => {
                resolve()
            }).catch(() => {
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
            let savePromises: Array<any> = []
            for (let group of groups) {
                let promise = ContactGroup.updateOne({ bexioId: group.id }, { name: group.name }, { upsert: true })
                savePromises.push(promise)
            }

            Promise.all(savePromises).then(() => {
                resolve()
            }).catch(() => {
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
            let savePromises: Array<any> = []

            for (let type of types) {
                let promise = ContactType.findOneAndUpdate({ bexioId: type.id }, { name: type.name }, { upsert: true })
                savePromises.push(promise)
            }

            Promise.all(savePromises).then(() => {
                resolve()
            }).catch(() => {
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
            let dateRegex = /(\d{2})\.(\d{2})\.(\d{4})/mg
            let orders = await bexioAPI.orders.list({})
            let savePromises: Array<any> = []
            console.log('Syncing ' + orders.length)
            for (let order of orders) {
                let bexioOrder = await bexioAPI.orders.show({}, order.id.toString())
                if (bexioOrder) {
                    let contact = await Contact.findOne({ bexioId: bexioOrder.contact_id })
                    let user = await Contact.findOne({ bexioId: bexioOrder.user_id })
                    let execDates: Array<Date> = []

                    //first sync all positions 
                    if (bexioOrder.positions) {
                        for (let position of bexioOrder.positions) {
                            await Position.findOneAndUpdate({ bexioId: position.id }, {
                                bexioId: position.id,
                                positionType: position.type,
                                text: position.text,
                                pos: position.pos,
                                internalPos: position.internal_pos,
                                articleId: position.article_id,
                                orderBexioId: bexioOrder.id,
                                positionTotal: position.position_total
                            }, { upsert: true })

                            if (position.text) {
                                let match = dateRegex.exec(position.text)
                                if (match) {
                                    execDates = execDates.concat(new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1])))
                                }
                            }
                        }
                    }

                    let promise = Order.findOneAndUpdate({ bexioId: bexioOrder.id }, {
                        bexioId: bexioOrder.id,
                        documentNr: bexioOrder.document_nr,
                        title: bexioOrder.title,
                        contact: contact,
                        total: bexioOrder.total,
                        user: user,
                        execDates: execDates,
                        positions: await Position.find({ orderBexioId: bexioOrder.id }),
                    }, { upsert: true })
                    savePromises.push(promise)
                    console.log('Synced ' + savePromises.length)
                }
            }

            Promise.all(savePromises).then(() => {
                resolve()
            }).catch(() => {
                reject()
            })
        })
    }
}