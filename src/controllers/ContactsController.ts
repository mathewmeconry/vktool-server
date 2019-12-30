import * as Express from 'express'
import Contact from '../entities/Contact';
import { getManager, In, FindManyOptions } from 'typeorm';
import ContactGroup from '../entities/ContactGroup';
import CollectionPoint from '../entities/CollectionPoint';
import { AuthRoles } from '../interfaces/AuthRoles';
import AuthService from '../services/AuthService';
import ContactService from '../services/ContactService';
import moment from 'moment'
import PdfService from '../services/PdfService';

export default class ContactsController {
    public static async getContacts(req: Express.Request, res: Express.Response): Promise<void> {
        const options: FindManyOptions<Contact> = {}
        if (!AuthService.isAuthorized(req.user.roles, AuthRoles.CONTACTS_READ)) {
            options.where = { id: req.user.bexioContact.id }
        }
        res.send(await getManager().getRepository(Contact).find(options))
    }

    public static async getMembers(req: Express.Request, res: Express.Response): Promise<void> {
        res.send(await ContactService.getActiveMembers(AuthService.isAuthorized(req.user.roles, AuthRoles.MEMBERS_READ)))
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

            if (req.body.collectionPointId === undefined) {
                contact.collectionPoint = undefined
            } else {
                contact.collectionPoint = await getManager().getRepository(CollectionPoint).findOne({ id: req.body.collectionPointId }) || contact.collectionPoint
            }

            contact.entryDate = (req.body.entryDate) ? new Date(req.body.entryDate) : undefined
            contact.exitDate = (req.body.exitDate) ? new Date(req.body.exitDate) : undefined
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

    public static async getMemberListPdf(req: Express.Request, res: Express.Response): Promise<void> {
        let members = await ContactService.getActiveMembers(AuthService.isAuthorized(req.user.roles, AuthRoles.MEMBERS_READ))
        members = members.sort((a, b) => (`${a.lastname} ${a.firstname}` < `${b.lastname} ${b.firstname}`) ? -1 : 1)
        res.contentType('application/pdf')
        res.setHeader('Content-Disposition', `inline; filename=Mitgliederliste ${moment(new Date()).format('DD-MM-YYYY')}.pdf`)
        res.send(await PdfService.generateMemberList(members))
    }
}