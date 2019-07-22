import * as Express from 'express'
import Contact from '../entities/Contact';
import { getManager, In } from 'typeorm';
import ContactGroup from '../entities/ContactGroup';
import CollectionPoint from '../entities/CollectionPoint';

export default class ContactsController {
    public static async getContacts(req: Express.Request, res: Express.Response): Promise<void> {
        res.send(await getManager().getRepository(Contact).find())
    }

    public static async getMembers(req: Express.Request, res: Express.Response): Promise<void> {
        let contacts = await getManager().getRepository(Contact).find()
        res.send(contacts.filter(contact => ((contact.contactGroups || []).find(group => group.bexioId === 7))))
    }

    public static async getRanks(req: Express.Request, res: Express.Response): Promise<void> {
        let filter = { 'bexioId': In([17, 13, 11, 12, 28, 29, 15, 27, 26, 10, 14, 33]) }
        let contactGroups = await getManager().getRepository(ContactGroup).find(filter)

        res.send(contactGroups)
    }

    public static async postContact(req: Express.Request, res: Express.Response): Promise<void> {
        let contact = await getManager().getRepository(Contact).findOne({ id: req.body.id })

        if (contact) {
            if (req.url.indexOf('members') > -1 && !contact.isMember()) {
                res.status(403)
                res.send({
                    message: 'Not Authorized'
                })
                return
            }

            contact.collectionPoint = await getManager().getRepository(CollectionPoint).findOne({ id: req.body.collectionPointId }) || contact.collectionPoint
            contact.entryDate = new Date(req.body.entryDate || contact.entryDate)
            contact.exitDate = new Date(req.body.exitDate || contact.exitDate)
            contact.bankName = req.body.bankName || contact.bankName
            contact.iban = req.body.iban || contact.iban
            contact.accountHolder = req.body.accountHolder || contact.accountHolder
            contact.moreMails = req.body.moreMails || contact.moreMails

            try {
                await contact.save()
                res.send(contact)
            } catch (err) {
                res.status(500)
                res.send({
                    message: 'sorry man...',
                    errors: err
                })
            }
        } else {
            res.status(500)
            res.send({
                message: 'sorry man...'
            })
        }
    }
}