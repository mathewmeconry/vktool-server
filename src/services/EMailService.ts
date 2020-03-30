import nodemailer from 'nodemailer'
import config from 'config'

export default class EMailService {
    private transporter: nodemailer.Transporter
    private from: string

    constructor(from: string) {
        this.from = from
        this.transporter = nodemailer.createTransport({
            host: config.get('mailer.host'),
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.get('mailer.user'),
                pass: config.get('mailer.pass')
            }
        })
    }

    public async sendMail(recipient: string[], replyTo: string = this.from, subject: string, html: string, attachments: Array<Object> = []) {
        await this.transporter.verify()

        //if(process.env.NODE_ENV !== 'production') recipient = ['app-stage@vkazu.ch']

        return await this.transporter.sendMail({
            from: this.from,
            to: recipient,
            subject: subject,
            html: html,
            replyTo,
            attachments
        })
    }
}