import * as Express from 'express'
import Contact from '../entities/Contact';
import { getManager, In } from 'typeorm';
import ContactGroup from '../entities/ContactGroup';

export default class ContactsController {
    public static async getContacts(req: Express.Request, res: Express.Response): Promise<void> {
        res.send(await getManager().getRepository(Contact).find())
    }

    public static async getMembers(req: Express.Request, res: Express.Response): Promise<void> {
        let contacts = await getManager().getRepository(Contact).find()
        res.send(contacts.filter(contact => ((contact.contactGroups || []).find(group => group.bexioId === 7))))
    }

    public static async getRanks(req: Express.Request, res: Express.Response): Promise<void> {
        let filter = { 'bexioId': In([17, 13, 11, 12, 28, 29, 15, 27, 26, 10, 14]) }
        let contactGroups = await getManager().getRepository(ContactGroup).find(filter)

        res.send(contactGroups)
    }
}