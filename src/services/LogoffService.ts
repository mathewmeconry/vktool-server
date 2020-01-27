import Contact from "../entities/Contact"
import Logoff from "../entities/Logoff"
import path from 'path'
import pug from 'pug'
import config = require("config")
import sass from 'node-sass'
import EMailService from "./EMailService"
import moment from 'moment'

export default class LogoffService {
    private static emailService = new EMailService('no-reply@vkazu.ch')

    public static async sendInformationMail(contact: Contact, logoffs: Logoff[]): Promise<void> {
        const email = pug.renderFile(path.resolve(__dirname, '../../public/emails/logoffInformation/logoffInformation.pug'), {
            apiEndpoint: config.get('apiEndpoint'),
            compiledStyle: sass.renderSync({ file: path.resolve(__dirname, '../../public/emails/logoffInformation/logoffInformation.scss') }).css,
            moment,
            sender: 'aufgebot@vkazu.ch',
            contact,
            logoffs
        })

        await LogoffService.emailService.sendMail(
            contact.mail,
            'aufgebot@vkazu.ch',
            'Neue Abmeldungen',
            email
        )
    }

    public static async sendChangeStateMail(contact: Contact, logoff: Logoff): Promise<void> {
        const email = pug.renderFile(path.resolve(__dirname, '../../public/emails/logoffInformation/logoffChangeState.pug'), {
            apiEndpoint: config.get('apiEndpoint'),
            compiledStyle: sass.renderSync({ file: path.resolve(__dirname, '../../public/emails/logoffInformation/logoffChangeState.scss') }).css,
            moment,
            sender: 'aufgebot@vkazu.ch',
            contact,
            logoff
        })

        await LogoffService.emailService.sendMail(
            contact.mail,
            'aufgebot@vkazu.ch',
            'Abmeldungstatusänderung',
            email,
        )
    }
}