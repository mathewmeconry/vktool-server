import * as Express from 'express'
import { getManager } from 'typeorm';
import Payout from '../entities/Payout';
import PayoutService from '../services/PayoutService';
import Contact from '../entities/Contact';

export default class PayoutController {
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

    public static async generatePDF4Member(req: Express.Request, res: Express.Response): Promise<void> {
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
                (await PayoutService.generatePDF4Member(
                    await getManager().getRepository(Payout).findOneOrFail(payoutId),
                    await getManager().getRepository(Contact).findOneOrFail(memberId))
                )
            )
        }

        res.end()
    }

    public static async generateHTML4Member(req: Express.Request, res: Express.Response): Promise<void> {
        if (!req.body.hasOwnProperty('payoutId') || !req.body.hasOwnProperty('memberId')) {
            res.status(402)
            res.send({
                message: 'Invalid request (field payoutId or memberId is missing)'
            })
        } else {
            res.contentType('application/pdf')
            res.send(
                (await PayoutService.generateHTML4Member(
                    await getManager().getRepository(Payout).findOneOrFail(req.body.payoutId),
                    await getManager().getRepository(Contact).findOneOrFail(req.body.memberId))
                ).toString()
            )
        }

        res.end()
    }
}