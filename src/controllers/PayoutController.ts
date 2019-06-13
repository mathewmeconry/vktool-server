import * as Express from 'express'
import { getManager } from 'typeorm';
import Payout from '../entities/Payout';
import PayoutService from '../services/PayoutService';
import Contact from '../entities/Contact';
import EMailService from '../services/EMailService';

export default class PayoutController {
    private static emailService = new EMailService('no-reply@vkazu.ch')

    public static async getPayouts(req: Express.Request, res: Express.Response): Promise<void> {
        res.send(await getManager().getRepository(Payout).find({
            join: {
                alias: 'payout',
                leftJoinAndSelect: {
                    compensations: 'payout.compensations',
                    billingReport: 'compensations.billingReport',
                    member: 'compensations.member',
                    order: 'billingReport.order'
                }
            }
        }))
    }

    public static async createPayout(req: Express.Request, res: Express.Response): Promise<void> {
        if (!req.body.until) {
            res.status(402)
            res.send({
                message: 'Invalid request (field until is missing)'
            })
        }
        let payout = new Payout(req.body.until, req.body.from)
        payout = await getManager().getRepository(Payout).save(payout)
        await PayoutService.reclaimCompensations(payout)
        res.send(payout)
    }

    public static async reclaim(req: Express.Request, res: Express.Response): Promise<void> {
        if (!req.body.id) {
            res.status(402)
            res.send({
                message: 'Invalid request (field id is missing)'
            })
        }
        const payout = await getManager().getRepository(Payout).findOne({ id: req.body.id })
        if (payout) {
            await PayoutService.reclaimCompensations(payout)
            res.send(payout)
        } else {
            res.status(500)
            res.send({
                message: 'sorry man...'
            })
        }
    }

    public static async generateMemberPDF(req: Express.Request, res: Express.Response): Promise<void> {
        const payoutId = req.body.payoutId || req.params.payout
        const memberId = req.body.memberId || req.params.member

        if (!payoutId || !memberId) {
            res.status(402)
            res.send({
                message: 'Invalid request (field payoutId or memberId is missing)'
            })
        } else {
            res.contentType('application/pdf')
            res.send(
                (await PayoutService.generateMemberPDF(
                    await getManager().getRepository(Payout).findOneOrFail(payoutId),
                    await getManager().getRepository(Contact).findOneOrFail(memberId))
                )
            )
        }

        res.end()
    }

    public static async generateMemberHTML(req: Express.Request, res: Express.Response): Promise<void> {
        if (!req.body.hasOwnProperty('payoutId') || !req.body.hasOwnProperty('memberId')) {
            res.status(402)
            res.send({
                message: 'Invalid request (field payoutId or memberId is missing)'
            })
        } else {
            res.contentType('application/pdf')
            res.send(
                (await PayoutService.generateMemberHTML(
                    await getManager().getRepository(Payout).findOneOrFail(req.body.payoutId),
                    await getManager().getRepository(Contact).findOneOrFail(req.body.memberId))
                ).toString()
            )
        }

        res.end()
    }

    public static async generatePayoutPDF(req: Express.Request, res: Express.Response): Promise<void> {
        if (!req.params.hasOwnProperty('payout')) {
            res.status(402)
            res.send({
                message: 'Invalid request (parameter payout is missing)'
            })
        } else {
            res.contentType('application/pdf')
            // TODO: Implement PDF
        }

        res.end()
    }

    public static async sendMails(req: Express.Request, res: Express.Response): Promise<void> {
        if (!req.body.hasOwnProperty('payoutId')) {
            res.status(402)
            res.send({
                message: 'Invalid request (field payoutId is missing)'
            })
        } else {
            const payout = await getManager().getRepository(Payout).findOneOrFail(req.body.payoutId)
            let memberIds: Array<number>
            let sendingPromises: Array<Promise<boolean>> = []

            if (req.body.hasOwnProperty('memberIds')) {
                memberIds = req.body.memberIds
            } else {
                memberIds = []
                payout.compensations.map(comp => {
                    if (memberIds.indexOf(comp.member.id) < 0) memberIds.push(comp.member.id)
                })
            }

            for (const memberId of memberIds) {
                sendingPromises.push(new Promise(async (resolve, reject) => {
                    const member = await getManager().getRepository(Contact).findOneOrFail(memberId)
                    const email = await PayoutService.generateMemberMail(payout, member)
                    const pdf = await PayoutService.generateMemberPDF(payout, member)

                    await PayoutController.emailService.sendMail(
                        member.mail,
                        'info@vkazu.ch',
                        'Abrechnung Verkehrskadetten-Entschädigung',
                        email,
                        [
                            {
                                filename: `Verkehrskadetten-Entschädigung ${member.lastname} ${member.firstname}.pdf`,
                                content: pdf
                            }
                        ]
                    )
                    
                    resolve()
                }))
            }

            await Promise.all(sendingPromises)
            res.contentType('application/json')
            res.send({ success: true })
        }

        res.end()
    }
}