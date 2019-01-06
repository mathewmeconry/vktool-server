import * as Express from 'express'
import Contact from '../entities/Contact';
import ContactGroup from '../entities/ContactGroup';

export default class ContactsController {
    public static async getContacts(req: Express.Request, res: Express.Response): Promise<void> {
        let contacts = await Contact.aggregate(
            [
                {
                    "$lookup": {
                        "from": ContactGroup.collection.name,
                        "localField": "contactGroups",
                        "foreignField": "_id",
                        "as": "contactGroups"
                    }
                }
            ])

        res.send(contacts)
    }

    public static async getMembers(req: Express.Request, res: Express.Response): Promise<void> {
        let contacts = await Contact.aggregate(
            [
                {
                    "$lookup": {
                        "from": ContactGroup.collection.name,
                        "localField": "contactGroups",
                        "foreignField": "_id",
                        "as": "contactGroups"
                    }
                },
                { "$match": { "contactGroups": { $elemMatch: { bexioId: 7 } } } }
            ])

        res.send(contacts)
    }

    public static async getRanks(req: Express.Request, res: Express.Response): Promise<void> {
        let filter = { 'bexioId': { $in: [17, 13, 11, 12, 28, 29, 15, 27, 26, 10, 14] } }
        let contactGroups = await ContactGroup.find(filter)

        res.send(contactGroups)
    }
}