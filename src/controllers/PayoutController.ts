import * as Express from 'express'
import { getManager } from 'typeorm';
import Payout from '../entities/Payout';
import PayoutService from '../services/PayoutService';
import Contact from '../entities/Contact';
import EMailService from '../services/EMailService';
import moment from 'moment'

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
            res.status(400)
            res.send({
                message: 'Invalid request (field until is missing)'
            })
        }
        const payoutRepo = getManager().getRepository(Payout)
        let payout = new Payout(new Date(req.body.until), new Date(req.body.from))
        payout = await payoutRepo.save(payout)
        await PayoutService.reclaimCompensations(payout)
        res.send(await payoutRepo.findOne(payout.id, {
            join: {
                alias: 'payout',
                leftJoinAndSelect: {
                    compensations: 'payout.compensations'
                }
            }
        }))
    }

    public static async reclaim(req: Express.Request, res: Express.Response): Promise<void> {
        if (!req.body.id) {
            res.status(400)
            res.send({
                message: 'Invalid request (field id is missing)'
            })
            return
        }
        const payout = await getManager().getRepository(Payout).findOne(req.body.id, {
            join: {
                alias: 'payout',
                leftJoinAndSelect: {
                    compensations: 'payout.compensations'
                }
            }
        })
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
            res.status(400)
            res.send({
                message: 'Invalid request (field payoutId or memberId is missing)'
            })
            return
        }

        const member = await getManager().getRepository(Contact).findOneOrFail(memberId)
        res.contentType('application/pdf')
        res.setHeader('Content-Disposition', `inline; filename=Verkehrskadetten-Entschädigung ${member.lastname} ${member.firstname}.pdf`)
        res.send(
            (await PayoutService.generateMemberPDF(
                await getManager().getRepository(Payout).findOneOrFail(payoutId),
                member)
            )
        )
    }

    public static async generateMemberHTML(req: Express.Request, res: Express.Response): Promise<void> {
        if (!req.body.hasOwnProperty('payoutId') || !req.body.hasOwnProperty('memberId')) {
            res.status(400)
            res.send({
                message: 'Invalid request (field payoutId or memberId is missing)'
            })
            return
        }

        res.contentType('text/html')
        res.send(
            (await PayoutService.generateMemberHTML(
                await getManager().getRepository(Payout).findOneOrFail(req.body.payoutId),
                await getManager().getRepository(Contact).findOneOrFail(req.body.memberId))
            ).toString()
        )
    }

    public static async generatePayoutPDF(req: Express.Request, res: Express.Response): Promise<void> {
        if (!req.params.hasOwnProperty('payout')) {
            res.status(400)
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
            res.status(400)
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
            }

            res.contentType('application/json')
            res.send({ success: true })
        }

        res.end()
    }

    public static async sendToBexio(req: Express.Request, res: Express.Response): Promise<void> {
        if (!req.body.hasOwnProperty('payoutId')) {
            res.status(400)
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
                const member = await getManager().getRepository(Contact).findOneOrFail(memberId)
                await PayoutService.sendMemberToBexio(payout, member)
            }

            res.contentType('application/json')
            res.send({ success: true })
        }

        res.end()
    }

    public static async generateXml(req: Express.Request, res: Express.Response): Promise<void> {
        const payoutId = req.body.payoutId || req.params.payout
        const memberIds = req.body.memberIds || req.params.memberIds

        if (!payoutId) {
            res.status(400)
            res.send({
                message: 'Invalid request (field payoutId is missing)'
            })
        } else {
            const payout = await getManager().getRepository(Payout).findOneOrFail(payoutId)

            res.contentType('application/xml')
            res.setHeader('Content-Disposition', `attachment; filename=Entschaedigungsperiode_${(payout.from > new Date('1970-01-01')) ? moment(payout.from).format('DD-MM-YYYY') : ''}_-_${moment(payout.until).format('DD-MM-YYYY')}.xml`)
            res.send(await PayoutService.generatePainXml(payout, memberIds))
        }
    }

    public static async transfer(req: Express.Request, res: Express.Response): Promise<void> {
        const payoutId = req.body.payoutId || req.params.payout
        const memberIds = req.body.memberIds || req.params.memberIds

        if (!payoutId) {
            res.status(400)
            res.send({
                message: 'Invalid request (field payoutId is missing)'
            })
        } else if (!memberIds) {
            res.status(400)
            res.send({
                message: 'Invalid request (field memberIds is missing)'
            })
        } else {
            const payout = await getManager().getRepository(Payout).findOneOrFail(payoutId)
            await PayoutService.transfer(payout, memberIds, req.user)

            res.contentType('application/json')
            res.send({ success: true })
        }
        res.end()
    }
}