import * as Express from 'express'
import { getManager } from 'typeorm';
import Payout from '../entities/Payout';

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
        await payout.claimCompensations()
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
            await payout.claimCompensations()
            res.send(payout)
        } else {
            res.status(500)
            res.send({
                message: 'sorry man...'
            })
        }
    }
}