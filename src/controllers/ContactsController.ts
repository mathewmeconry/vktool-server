import * as Express from 'express'
import ContactService from '../services/ContactService'
import moment from 'moment'
import PdfService from '../services/PdfService'

export default class ContactsController {
    public static async getMemberListPdf(req: Express.Request, res: Express.Response): Promise<void> {
        let members = await ContactService.getActiveMembers(
            false
        )

        res.contentType('application/pdf')
        res.setHeader(
            'Content-Disposition',
            `inline; filename=Mitgliederliste ${moment(new Date()).format('DD-MM-YYYY')}.pdf`
        )
        res.send(await PdfService.generateMemberList(members))
    }
}
