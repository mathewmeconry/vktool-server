import * as Express from 'express'
import BillingReport from '../entities/BillingReport';
import Contact from '../entities/Contact';
import Order from '../entities/Order';
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

        if (!AuthService.isAuthorized(req.user.roles, AuthRoles.BILLINGREPORTS_READ)) {
            billingReportsQuery = billingReportsQuery.where('billingReport.creator = :id', { id: req.user.id })
        }

        res.send(await billingReportsQuery.getMany())
    }

    public static async getOpenOrders(req: Express.Request, res: Express.Response): Promise<void> {
        let now = new Date()
        let before15Days = new Date()
        before15Days.setDate(before15Days.getDate() - 15)
        let in15Days = new Date()
        in15Days.setDate(in15Days.getDate() + 15)

        let orders = await getManager()
            .getRepository(Order)
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.positions', 'position')
            .leftJoinAndSelect('order.contact', 'contact')
            .where('order.validFrom <= :date', { date: now.toISOString() })
            .getMany()

        orders = orders.filter(order => order.execDates.find(execDate => { return execDate > before15Days && execDate < in15Days }))

        res.send(orders.filter(order => order.execDates.length >= (order.billingReports || []).length))
    }

    public static async put(req: Express.Request, res: Express.Response): Promise<void> {
        let contactRepo = getManager().getRepository(Contact)

        let order = await getManager().getRepository(Order).findOneOrFail({ id: req.body.orderId })
        let els = await contactRepo.findByIds((req.body.els as Array<Contact>).map(el => el.id))
        let drivers = await contactRepo.findByIds((req.body.drivers as Array<Contact>).map(driver => driver.id))

        let billingReport = new BillingReport(
            req.user,
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

    public static async approveDeclineReset(req: Express.Request, res: Express.Response): Promise<void> {
        let billingReportRepo = getManager().getRepository(BillingReport)
        let billingReport = await billingReportRepo.createQueryBuilder().where('id = :id', { id: req.body.id }).getOne()
        let state = req.path.split('/')[req.path.split('/').length - 1]

        if (billingReport) {
            getManager().transaction(async (transaction) => {
                billingReport = billingReport as BillingReport

                switch (state) {
                    case 'approve':
                        billingReport.state = 'approved'
                        billingReport.approvedBy = req.user
                        await transaction.createQueryBuilder()
                            .update(OrderCompensation)
                            .set({ approved: true, updatedBy: req.user })
                            .where('billingReport = :id', { id: billingReport.id })
                            .andWhere('deletedAt IS NULL')
                            .execute()
                        break
                    case 'decline':
                        billingReport.state = 'declined'
                        break
                    case 'reset':
                        billingReport.state = 'pending'
                        break
                }

                billingReport.updatedBy = req.user
                billingReport = await transaction.save(billingReport)
            }).then(() => {
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
            if (AuthService.isAuthorized(req.user.roles, AuthRoles.BILLINGREPORTS_EDIT) ||
                (billingReport.creatorId == req.user.id && billingReport.state === 'pending')) {
                for (let i in req.body) {
                    if (['id', 'state'].indexOf(i) < 0) {
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