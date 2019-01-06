import * as Express from 'express'
import Contact from '../entities/Contact';
import ContactGroup from '../entities/ContactGroup';
import ContactGroupModel from '../models/ContactGroupModel';

export default class ContactsController {
    public static async getContacts(req: Express.Request, res: Express.Response): Promise<void> {
        /* let contacts = await Contact.aggregate(
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
 */

        let contacts = await Contact.find({}).populate('contactGroups')

        res.send(contacts)
    }

    public static async getMembers(req: Express.Request, res: Express.Response): Promise<void> {
        /*let contacts = await Contact.aggregate(
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
                    ]) */

        let contacts = await Contact.find({}).populate('contactGroups')

        res.send(contacts.filter((elem) => {
            return (elem.contactGroups as Array<ContactGroupModel>).filter(group => group.bexioId === 7).length > 0
        }))
    }

    public static async getRanks(req: Express.Request, res: Express.Response): Promise<void> {
        let filter = { 'bexioId': { $in: [17, 13, 11, 12, 28, 29, 15, 27, 26, 10, 14] } }
        let contactGroups = await ContactGroup.find(filter)

        res.send(contactGroups)
    }
}