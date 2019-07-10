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
import { BexioService } from "./BexioService";
import { BillsStatic } from "bexio";
const sepaXML = require('sepa-xml')

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
        const compensations = (await CompensationService.getByPayoutAndMember(payout.id, member.id))
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
                        location: 'Wallisellen',
                        date: moment(new Date()).format('DD.MM.YYYY'),
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
                    },
                    puppeteerOptions: {
                        userDataDir: '/tmp',
                        headless: true,
                        args: [
                            '--disable-dev-shm-usage',
                            '--no-sandbox'
                        ]
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
            location: 'Wallisellen',
            date: moment(new Date()).format('DD.MM.YYYY'),
            until: moment(payout.until).format('DD.MM.YYYY'),
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
                        compiledStyle: sass.renderSync({ file: path.resolve(__dirname, '../../public/emails/memberPayout/memberPayout.scss') }).css,
                        member
                    })
                )
            })
        })
    }

    public static async sendMemberToBexio(payout: Payout, member: Contact): Promise<void> {
        const compensations = await CompensationService.getByPayoutAndMember(payout.id, member.id)

        const positions = compensations.map<BillsStatic.CustomPositionCreate>(comp => {
            return {
                amount: '1',
                type: "KbPositionCustom",
                tax_id: 13,
                text: `${moment(comp.date).format('DD.MM.YYYY')} / ${comp.description}`,
                unit_price: comp.amount.toFixed(3),
                account_id: 179,
                discount_in_percent: 0,
                unit_id: 1
            }
        })
        await BexioService.createBill(positions, member, true, `Entschädiungsauszahlung ${moment(payout.from).format('DD.MM.YYYY')}`, `Entschädiungsauszahlung ${moment(payout.from).format('DD.MM.YYYY')}`)
    }

    public static generatePainXml(payout: Payout): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            const xmlFile = new sepaXML()
            const messageId = new Date().toISOString()
            const compensations = await CompensationService.getByPayout(payout.id)

            xmlFile.setHeaderInfo({
                messageId,
                initiator: 'VERKEHRSKADETTEN ABTEILUNG ZÜRCHER-UNTERLAND'
            })

            xmlFile.setPaymentInfo({
                id: messageId,
                method: 'TRF',
                senderName: 'VERKEHRSKADETTEN ABTEILUNG ZÜRCHER-UNTERLAND',
                senderIBAN: 'CH8681477000003911939',
                bic: 'RAIFCH22E77'
            });

            const byMember: { [index: string]: Array<Compensation<any>> } = {}
            compensations.forEach((comp) => {
                if (!byMember.hasOwnProperty(comp.member.id)) byMember[comp.member.id] = []
                byMember[comp.member.id].push(comp)
            })

            for (const memberId in byMember) {
                const memberCompensations = byMember[memberId]
                const member = memberCompensations[0].member
                const amount = memberCompensations.map((element) => element.amount).reduce((prev, curr) => prev + curr)

                if (amount > 0) {
                    xmlFile.addTransaction({
                        id: memberId,
                        amount: amount.toFixed(2),
                        name: `${member.lastname} ${member.firstname}`,
                        iban: (member.iban) ? member.iban.replace(/ /g, '') : '',
                        description: `Soldperiode ${(payout.from > new Date('1970-01-01')) ? moment(payout.from).format('DD.MM.YYYY') : ''} bis ${moment(payout.until).format('DD.MM.YYYY')}`
                    });
                }
            }

            xmlFile.compile((err: Error, out: string) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(out.replace(/"EUR"/g, '"CHF"').replace('xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03"', 'xmlns="http://www.six-interbank-clearing.com/de/pain.001.001.03.ch.02.xsd"').replace('xsi:schemaLocation="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03 pain.001.001.03.xsd"', 'xsi:schemaLocation="http://www.six-interbank-clearing.com/de/pain.001.001.03.ch.02.xsd  pain.001.001.03.ch.02.xsd"'))
                }
            })
        })
    }
}