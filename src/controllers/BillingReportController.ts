import * as Express from 'express'
import BillingReport from '../entities/BillingReport';
import Contact from '../entities/Contact';
import Order from '../entities/Order';
import User from '../entities/User';
import { getManager } from 'typeorm';
import OrderCompensation from '../entities/OrderCompensation';
import Compensation from '../entities/Compensation';


export default class BillingReportController {
    public static async getBillingReports(req: Express.Request, res: Express.Response): Promise<void> {
        let billingReports = await getManager().getRepository(BillingReport)
            .createQueryBuilder('billingReport')
            .leftJoinAndSelect('billingReport.creator', 'user')
            .leftJoinAndSelect('billingReport.order', 'order')
            .leftJoinAndSelect('billingReport.compensations', 'compensations')
            .leftJoinAndSelect('compensations.member', 'member')
            .leftJoinAndSelect('billingReport.els', 'els')
            .leftJoinAndSelect('billingReport.drivers', 'drivers')
            .getMany()

        res.send(billingReports)
    }

    public static async getOpenOrders(req: Express.Request, res: Express.Response): Promise<void> {
        let now = new Date()
        let before14Days = now
        before14Days.setDate(before14Days.getDate() - 14)

        let orders = await getManager()
            .getRepository(Order)
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.positions', 'position')
            .where('order.validFrom <= :date', { date: now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() })
            .getMany()

        orders = orders.filter(order => order.execDates.find(execDate => execDate >= before14Days))

        res.send(orders.filter(order => order.execDates.length >= (order.billingReports || []).length))
    }

    public static async put(req: Express.Request, res: Express.Response): Promise<void> {
        let contactRepo = getManager().getRepository(Contact)
        let billingReportRepo = getManager().getRepository(BillingReport)

        let creator = await getManager().getRepository(User).findOneOrFail({ id: req.body.creatorId })
        let order = await getManager().getRepository(Order).findOneOrFail({ id: req.body.orderId })
        let els = await contactRepo.findByIds(req.body.els)
        let drivers = await contactRepo.findByIds(req.body.drivers)

        let billingReport = new BillingReport(
            creator,
            order,
            new Date(req.body.date),
            [],
            els,
            drivers,
            req.body.food,
            req.body.remarks,
            'pending'
        )
        billingReport.updatedBy = req.user
        billingReport = await billingReportRepo.save(billingReport)


        let compensationEntries = []
        for (let i in req.body.compensationEntries) {
            let entry = req.body.compensationEntries[i]
            let member = await contactRepo.findOneOrFail({ id: parseInt(i) })
            let from = new Date("1970-01-01 " + entry.from)
            let until = new Date("1970-01-01 " + entry.until)

            let compensationEntry = new OrderCompensation(
                member,
                creator,
                billingReport.date,
                billingReport,
                from,
                until,
                0,
                0,
                entry.charge
            )
            compensationEntry.updatedBy = req.user

            await getManager().getRepository(OrderCompensation).save(compensationEntry)
            // reset the billing report to convert it to json (circular reference)
            //@ts-ignore
            compensationEntry.billingReport = {}
            compensationEntries.push(compensationEntry)
        }

        billingReport.compensations = compensationEntries
        await billingReportRepo.save(billingReport)
        res.send(billingReport)
    }

    public static async approve(req: Express.Request, res: Express.Response): Promise<void> {
        let billingReportRepo = getManager().getRepository(BillingReport)
        let billingReport = await billingReportRepo.createQueryBuilder().where('id = :id', { id: req.body.id }).getOne()

        if (billingReport) {
            getManager().transaction(async (transaction) => {
                billingReport = billingReport as BillingReport
                await transaction.createQueryBuilder()
                    .update(OrderCompensation)
                    .set({ approved: true, updatedBy: req.user })
                    .where('billingReport = :id', { id: billingReport.id })
                    .execute()

                billingReport.state = 'approved'
                billingReport.updatedBy = req.user
                await transaction.save(billingReport)
                res.send(billingReport)
            }).catch(err => {
                res.status(500)
                res.send({
                    message: 'sorry man...'
                })
            })
        } else {
            res.status(500)
            res.send({
                message: 'sorry man...'
            })
        }
    }

    public static async edit(req: Express.Request, res: Express.Response): Promise<void> {
        let billingReportRepo = getManager().getRepository(BillingReport)
        let billingReport = await billingReportRepo.findOne({ id: req.body._id })
        if (billingReport) {
            for (let i of req.body) {
                //@ts-ignore
                billingReport[i] = req.body[i]
            }

            billingReport.updatedBy = req.user
            await billingReportRepo.save(billingReport)
            res.send(billingReport)
        } else {
            res.status(500)
            res.send({
                message: 'sorry man...'
            })
        }
    }
}