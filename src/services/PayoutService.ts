import Payout from "../entities/Payout";
import Compensation from "../entities/Compensation";
import { getManager } from "typeorm";
import CompensationService from "./CompensationService";
import { GeneratePdfOptions, generatePdf } from 'tea-school';
import * as path from 'path';
import fs from 'fs'
import * as pug from 'pug'
import Contact from "../entities/Contact";
import sass from 'node-sass'
import moment from 'moment'
import config = require("config");

export default class PayoutService {

    public static async reclaimCompensations(payout: Payout): Promise<void> {
        if (!payout.id) throw new Error('Payout has first to be saved')

        let qb = getManager().getRepository(Compensation).createQueryBuilder('compensation')
        await qb.update().set({ payout: null }).where('payout = :payout', { payout: payout.id }).execute()

        let query = qb.update()
            .set({
                payout: payout
            })
            .where('payout is NULL')
            .andWhere('date <= :dateUntil', { dateUntil: payout.until })
            .andWhere('date >= :dateFrom', { dateFrom: payout.from })
            .andWhere('approved = 1')
            .andWhere('deletedAt is NULL')

        await query.execute()
    }

    public static async generateMemberPDF(payout: Payout, member: Contact): Promise<Buffer> {
        const compensations = (await CompensationService.getByPayoutAndMember(payout.id, member.id)).sort((a, b) => (a.date > b.date) ? 1 : -1)
        const compensationTotal = compensations.reduce((a, b) => { return { amount: a.amount + b.amount } }, { amount: 0 }).amount

        return new Promise<Buffer>((resolve, reject) => {
            fs.readFile(path.resolve(__dirname, '../../public/logo.png'), async (err, data) => {
                if (err) {
                    reject(err)
                    return
                }

                const options: GeneratePdfOptions = {
                    htmlTemplatePath: path.resolve(__dirname, '../../public/pdfs/pugs/memberPayout.pug'),
                    styleOptions: {
                        file: path.resolve(__dirname, '../../public/pdfs/scss/memberPayout.scss')
                    },
                    htmlTemplateOptions: {
                        from: (payout.from > new Date('1970-01-01')) ? moment(payout.from).format('DD.MM.YYYY') : '',
                        until: moment(payout.until).format('DD.MM.YYYY'),
                        total: compensationTotal,
                        member,
                        compensations
                    },
                    pdfOptions: {
                        printBackground: true,
                        displayHeaderFooter: true,
                        headerTemplate: pug.renderFile(path.resolve(__dirname, '../../public/pdfs/pugs/header.pug'), { logo: `data:image/png;base64,${data.toString('base64')}` }),
                        footerTemplate: pug.renderFile(path.resolve(__dirname, '../../public/pdfs/pugs/footer.pug')),
                        format: 'A4',
                        margin: {
                            top: '25mm',
                            left: '0',
                            bottom: '25mm',
                            right: '0'
                        }
                    }
                }

                resolve(await generatePdf(options))
            })
        })
    }

    public static async generateMemberHTML(payout: Payout, member: Contact): Promise<String> {
        const compensations = await CompensationService.getByPayoutAndMember(payout.id, member.id)
        const compensationTotal = compensations.reduce((a, b) => { return { amount: a.amount + b.amount } }, { amount: 0 }).amount


        return pug.renderFile(path.resolve(__dirname, '../../public/pdfs/pugs/memberPayout.pug'), {
            until: payout.until,
            compiledStyle: sass.renderSync({ file: path.resolve(__dirname, '../../public/pdfs/scss/memberPayout.scss') }).css,
            total: compensationTotal,
            member,
            compensations
        })
    }

    public static async generateMemberMail(payout: Payout, member: Contact): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fs.readFile(path.resolve(__dirname, '../../public/logo.png'), async (err, data) => {
                if (err) {
                    reject(err)
                    return
                }

                resolve(
                    pug.renderFile(path.resolve(__dirname, '../../public/emails/memberPayout/memberPayout.pug'), {
                        apiEndpoint: config.get('apiEndpoint'),
                        until: payout.until,
                        compiledStyle: sass.renderSync({ file: path.resolve(__dirname, '../../public/emails/memberPayout/memberPayout.scss') }).css,
                        member
                    })
                )
            })
        })
    }
}