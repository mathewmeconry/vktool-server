import Contact from "../entities/Contact";
import * as Express from 'express'
import AuthService from "../services/AuthService";
import { AuthRoles } from "../interfaces/AuthRoles";
import { getManager } from "typeorm";
import Compensation from "../entities/Compensation";
import CustomCompensation from "../entities/CustomCompensation";
import BillingReport from "../entities/BillingReport";
import OrderCompensation from "../entities/OrderCompensation";

export default class CompensationController {
    public static async getAll(req: Express.Request, res: Express.Response): Promise<void> {
        res.send(
            await getManager()
                .getRepository(Compensation)
                .createQueryBuilder('compensation')
                .leftJoinAndSelect('compensation.member', 'member')
                .leftJoinAndSelect('compensation.creator', 'creator')
                .leftJoinAndSelect('compensation.billingReport', 'billingReport')
                .leftJoinAndSelect('billingReport.order', 'order')
                .where('deletedAt IS NULL')
                .getMany()
        )
    }

    public static async getUser(req: Express.Request, res: Express.Response): Promise<void> {
        res.send(await getManager().getRepository(Compensation).find({ member: req.params.member }))
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

            getManager().getRepository(Compensation).save(entry).then(() => {
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
            let promises = []

            if (req.body.hasOwnProperty('billingReportId')) {
                billingReport = await getManager().getRepository(BillingReport).createQueryBuilder('billingReport').where('id = :id', { id: req.body.billingReportId }).getOne()
            }

            if (billingReport) {
                for (let entry of req.body.entries) {
                    let member = await contactRepo.findOneOrFail({ id: entry.id })
                    let from = new Date("1970-01-01 " + entry.from)
                    let until = new Date("1970-01-01 " + entry.until)

                    let compensationEntry = new OrderCompensation(
                        member,
                        req.user,
                        billingReport.date,
                        billingReport,
                        from,
                        until,
                        0,
                        0,
                        entry.charge,
                        (billingReport.state === 'approved') ? true : false
                    )

                    promises.push(getManager().getRepository(OrderCompensation).save(compensationEntry))
                }
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

                    promises.push(getManager().getRepository(CustomCompensation).save(compensationEntry))
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
            await compensationRepo.save(compensation)
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
            await compensationRepo.save(compensation)
            res.send(compensation)
        } else {
            res.status(500)
            res.send({
                message: 'sorry man...'
            })
        }
    }
}