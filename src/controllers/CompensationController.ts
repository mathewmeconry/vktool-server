import Contact from "../entities/Contact";
import * as Express from 'express'
import AuthService from "../services/AuthService";
import { AuthRoles } from "../interfaces/AuthRoles";
import { getManager, IsNull } from "typeorm";
import Compensation from "../entities/Compensation";
import CustomCompensation from "../entities/CustomCompensation";
import BillingReport from "../entities/BillingReport";
import OrderCompensation from "../entities/OrderCompensation";

export default class CompensationController {
    public static async getAll(req: Express.Request, res: Express.Response): Promise<void> {
        Promise.all([
            getManager()
                .getRepository(OrderCompensation)
                .createQueryBuilder('compensation')
                .select([
                    'compensation.id',
                    'compensation.amount',
                    'compensation.date',
                    'compensation.approved',
                    'compensation.approvedBy',
                    'compensation.paied',
                    'compensation.valutaDate',
                    'compensation.from',
                    'compensation.until'
                ])
                .leftJoinAndSelect('compensation.member', 'member')
                .leftJoinAndSelect('compensation.creator', 'creator')
                .leftJoinAndSelect('compensation.billingReport', 'billingReport')
                .leftJoinAndSelect('billingReport.order', 'order')
                .where('deletedAt IS NULL')
                .getMany(),
            getManager()
                .getRepository(CustomCompensation)
                .createQueryBuilder('compensation')
                .select([
                    'compensation.id',
                    'compensation.description',
                    'compensation.amount',
                    'compensation.date',
                    'compensation.approved',
                    'compensation.approvedBy',
                    'compensation.paied',
                    'compensation.valutaDate'
                ])
                .leftJoinAndSelect('compensation.member', 'member')
                .leftJoinAndSelect('compensation.creator', 'creator')
                .where('deletedAt IS NULL')
                .getMany()
        ]).then(data => {
            res.send((data[0] as any).concat(data[1]))
        })
    }

    public static async getUser(req: Express.Request, res: Express.Response): Promise<void> {
        Promise.all([
            getManager()
                .getRepository(OrderCompensation)
                .createQueryBuilder('compensation')
                .select([
                    'compensation.id',
                    'compensation.amount',
                    'compensation.date',
                    'compensation.approved',
                    'compensation.approvedBy',
                    'compensation.paied',
                    'compensation.valutaDate',
                    'compensation.from',
                    'compensation.until'
                ])
                .leftJoinAndSelect('compensation.member', 'member')
                .leftJoinAndSelect('compensation.creator', 'creator')
                .leftJoinAndSelect('compensation.billingReport', 'billingReport')
                .leftJoinAndSelect('billingReport.order', 'order')
                .where('deletedAt IS NULL')
                .andWhere('memberId = :id', { id: parseInt(req.params.member) })
                .andWhere('compensation.approved = true')
                .getMany(),
            getManager()
                .getRepository(CustomCompensation)
                .createQueryBuilder('compensation')
                .select([
                    'compensation.id',
                    'compensation.description',
                    'compensation.amount',
                    'compensation.date',
                    'compensation.approved',
                    'compensation.approvedBy',
                    'compensation.paied',
                    'compensation.valutaDate'
                ])
                .leftJoinAndSelect('compensation.member', 'member')
                .leftJoinAndSelect('compensation.creator', 'creator')
                .where('deletedAt IS NULL')
                .andWhere('memberId = :id', { id: parseInt(req.params.member) })
                .andWhere('compensation.approved = true')
                .getMany()
        ]).then(data => {
            res.send((data[0] as any).concat(data[1]))
        })
    }

    public static async add(req: Express.Request, res: Express.Response): Promise<void> {
        let member = await getManager().getRepository(Contact).findOneOrFail({ id: req.body.member })
        if (member) {
            let entry = new CustomCompensation(
                member,
                req.user,
                req.body.amount,
                new Date(req.body.date),
                req.body.description,
                AuthService.isAuthorized(req, AuthRoles.COMPENSATIONS_APPROVE)
            )
            entry.updatedBy = req.user

            entry.save().then((entry) => {
                res.send(entry)
            }).catch((err) => {
                res.status(500)
                res.send({
                    message: 'sorry man...'
                })
            })
        } else {
            res.status(500)
            res.send({ message: 'Sorry man...' })
        }
    }

    public static async addBulk(req: Express.Request, res: Express.Response): Promise<void> {
        if (!req.body.hasOwnProperty('billingReportId') && !req.user.roles.includes(AuthRoles.COMPENSATIONS_CREATE)) {
            res.status(403)
            res.send({
                error: 'Not authorized'
            })
        } else {
            let billingReport = undefined;
            let contactRepo = getManager().getRepository(Contact)
            let promises: Array<Promise<OrderCompensation | CustomCompensation>> = []

            if (req.body.hasOwnProperty('billingReportId')) {
                billingReport = await getManager().getRepository(BillingReport).createQueryBuilder('billingReport').where('id = :id', { id: req.body.billingReportId }).getOne()
            }

            if (billingReport) {
                for (let entry of req.body.entries) {
                    let member = await contactRepo.findOneOrFail({ id: entry.id })

                    let compensationEntry = new OrderCompensation(
                        member,
                        req.user,
                        billingReport.date,
                        billingReport,
                        new Date(entry.from),
                        new Date(entry.until),
                        0,
                        0,
                        entry.charge,
                        (billingReport.state === 'approved') ? true : false
                    )

                    promises.push(compensationEntry.save())
                }
                billingReport.updatedBy = req.user
                await billingReport.save()
            } else {
                for (let entry of req.body.entries) {
                    let member = await contactRepo.findOneOrFail({ id: parseInt(entry.id) })

                    let compensationEntry = new CustomCompensation(
                        member,
                        req.user,
                        entry.amount,
                        entry.date,
                        entry.description
                    )

                    promises.push(compensationEntry.save())
                }
            }

            await Promise.all<OrderCompensation | CustomCompensation>(promises)
            res.status(200)
            res.send({
                success: true
            })
        }
    }

    public static async approve(req: Express.Request, res: Express.Response): Promise<void> {
        let compensationRepo = getManager().getRepository(Compensation)
        let compensation = await compensationRepo.createQueryBuilder().where('id = :id', { id: req.body.id }).getOne()

        if (compensation) {
            compensation.approved = true
            compensation.approvedBy = req.user
            compensation.updatedBy = req.user
            await compensation.save()
            res.send({ success: true })
        } else {
            res.status(500)
            res.send({
                message: 'sorry man...'
            })
        }
    }

    public static async delete(req: Express.Request, res: Express.Response): Promise<void> {
        let compensationRepo = getManager().getRepository(Compensation)
        let compensation = await compensationRepo.createQueryBuilder().where('id = :id', { id: req.body.id }).getOne()

        if (compensation) {
            compensation.deletedAt = new Date()
            compensation.deletedBy = req.user
            await compensation.save()
            
            if (compensation instanceof OrderCompensation) {
                let billingReport = await getManager().getRepository(BillingReport).createQueryBuilder('billingReport').where('id = :id', { id: compensation.billingReportId }).getOne()

                if (billingReport) {
                    billingReport.updatedBy = req.user
                    await billingReport.save()
                } else {
                    res.status(500)
                    res.send({
                        message: 'sorry man...'
                    })
                    return
                }
            }

            res.send(compensation)
        } else {
            res.status(500)
            res.send({
                message: 'sorry man...'
            })
        }
    }
}