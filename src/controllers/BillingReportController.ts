import * as Express from 'express'
import BillingReport from '../entities/BillingReport';
import Contact from '../entities/Contact';
import Order from '../entities/Order';
import User from '../entities/User';
import { getManager } from 'typeorm';
import OrderCompensation from '../entities/OrderCompensation';
import AuthService from '../services/AuthService';
import { AuthRoles } from '../interfaces/AuthRoles';


export default class BillingReportController {
    public static async getBillingReports(req: Express.Request, res: Express.Response): Promise<void> {
        let billingReportsQuery = getManager().getRepository(BillingReport)
            .createQueryBuilder('billingReport')
            .leftJoinAndSelect('billingReport.creator', 'user')
            .leftJoinAndSelect('billingReport.order', 'order')
            .leftJoinAndSelect('billingReport.compensations', 'compensations', 'compensations.deletedAt IS NULL')
            .leftJoinAndSelect('compensations.member', 'member')
            .leftJoinAndSelect('billingReport.els', 'els')
            .leftJoinAndSelect('billingReport.drivers', 'drivers')

        if (!AuthService.isAuthorized(req, AuthRoles.BILLINGREPORTS_READ)) {
            billingReportsQuery = billingReportsQuery.where('billingReport.creator = :id', { id: req.user.id })
        }

        res.send(await billingReportsQuery.getMany())
    }

    public static async getOpenOrders(req: Express.Request, res: Express.Response): Promise<void> {
        let now = new Date()
        let before14Days = new Date()
        before14Days.setDate(before14Days.getDate() - 14)

        let orders = await getManager()
            .getRepository(Order)
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.positions', 'position')
            .leftJoinAndSelect('order.contact', 'contact')
            .where('order.validFrom <= :date', { date: now.toISOString() })
            .getMany()

        orders = orders.filter(order => order.execDates.find(execDate => execDate >= before14Days))

        res.send(orders.filter(order => order.execDates.length >= (order.billingReports || []).length))
    }

    public static async put(req: Express.Request, res: Express.Response): Promise<void> {
        let contactRepo = getManager().getRepository(Contact)

        let creator = await getManager().getRepository(User).findOneOrFail({ id: req.body.creatorId })
        let order = await getManager().getRepository(Order).findOneOrFail({ id: req.body.orderId })
        let els = await contactRepo.findByIds((req.body.els as Array<Contact>).map(el => el.id))
        let drivers = await contactRepo.findByIds((req.body.drivers as Array<Contact>).map(driver => driver.id))

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
        billingReport = await billingReport.save()


        let compensationEntries = []
        for (let i in req.body.compensationEntries) {
            let entry = req.body.compensationEntries[i]
            let member = await contactRepo.findOneOrFail({ id: parseInt(i) })

            let compensationEntry = new OrderCompensation(
                member,
                creator,
                billingReport.date,
                billingReport,
                new Date(entry.from),
                new Date(entry.until),
                0,
                0,
                entry.charge
            )
            compensationEntry.updatedBy = req.user

            await compensationEntry.save()
            // reset the billing report to convert it to json (circular reference)
            //@ts-ignore
            compensationEntry.billingReport = {}
            compensationEntries.push(compensationEntry)
        }

        billingReport.compensations = compensationEntries
        await billingReport.save()
        res.send(billingReport)
    }

    public static async approveDecline(req: Express.Request, res: Express.Response): Promise<void> {
        let billingReportRepo = getManager().getRepository(BillingReport)
        let billingReport = await billingReportRepo.createQueryBuilder().where('id = :id', { id: req.body.id }).getOne()
        let state = req.path.split('/')[req.path.split('/').length - 1]

        if (billingReport) {
            getManager().transaction(async (transaction) => {
                billingReport = billingReport as BillingReport

                if (state === 'approve') {
                    await transaction.createQueryBuilder()
                        .update(OrderCompensation)
                        .set({ approved: true, updatedBy: req.user })
                        .where('billingReport = :id', { id: billingReport.id })
                        .andWhere('deletedAt IS NULL')
                        .execute()
                }

                if (state === 'approve') {
                    billingReport.state = 'approved'
                } else {
                    billingReport.state = 'declined'
                }
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
        let billingReport = await billingReportRepo.createQueryBuilder('billingReport').where('id = :id', { id: req.body.id }).getOne()

        if (billingReport) {
            if (AuthService.isAuthorized(req, AuthRoles.BILLINGREPORTS_EDIT) ||
                (billingReport.creator.id == req.user.id && billingReport.state === 'pending')) {
                for (let i in req.body) {
                    if (i !== 'id') {
                        //@ts-ignore
                        billingReport[i] = req.body[i]
                    }
                }

                billingReport.date = new Date(billingReport.date)
                billingReport.updatedBy = req.user
                await billingReport.save()
                res.send(billingReport)
            } else {
                res.status(403)
                res.send({
                    message: 'Not Authorized'
                })
            }
        } else {
            res.status(500)
            res.send({
                message: 'sorry man...'
            })
        }
    }
}