import * as Express from 'express'
import BillingReport from '../entities/BillingReport';
import Contact from '../entities/Contact';
import Order from '../entities/Order';
import CompensationEntry from '../entities/CompensationEntry';
import User from '../entities/User';
import CompensationEntryModel from '../models/CompensationEntryModel';
import BillingReportModel from '../models/BillingReportModel';
import OrderModel from '../models/OrderModel';


export default class BillingReportController {
    public static async getBillingReports(req: Express.Request, res: Express.Response): Promise<void> {
        let billingReports = await BillingReport.aggregate(
            [
                {
                    "$lookup": {
                        "from": User.collection.name,
                        "localField": "creator",
                        "foreignField": "_id",
                        "as": "creator"
                    }
                },
                {
                    "$lookup": {
                        "from": Order.collection.name,
                        "localField": "order",
                        "foreignField": "_id",
                        "as": "order"
                    }
                },
                {
                    "$lookup": {
                        "from": User.collection.name,
                        "localField": "approvedBy",
                        "foreignField": "_id",
                        "as": "approvedBy"
                    }
                },
                {
                    "$unwind": {
                        "path": "$creator",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$unwind": {
                        "path": "$order",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$unwind": {
                        "path": "$approvedBy",
                        "preserveNullAndEmptyArrays": true
                    }
                }
            ]
        )

        let compensations = await BillingReport.aggregate(
            [
                { "$unwind": "$compensations" },
                {
                    "$lookup": {
                        "from": CompensationEntry.collection.name,
                        "localField": "compensations",
                        "foreignField": "_id",
                        "as": "compensations"
                    }
                },
                { "$unwind": "$compensations" },
                {
                    "$lookup": {
                        "from": 'contacts',
                        "localField": "compensations.member",
                        "foreignField": "_id",
                        "as": "compensations.member"
                    }
                },
                {
                    "$unwind": "$compensations.member"
                },
                {
                    "$group": {
                        "_id": "$_id",
                        "compensations": { "$push": "$compensations" }
                    }
                }
            ]
        )

        let compensationsById: { [index: string]: CompensationEntryModel } = {}
        for (let compensation of compensations) {
            compensationsById[compensation._id] = compensation.compensations
        }

        let reports = []
        for (let billingReport of billingReports) {
            billingReport.compensations = compensationsById[billingReport._id]
            reports.push(billingReport)
        }

        res.send(reports)
    }

    public static async getOpenOrders(req: Express.Request, res: Express.Response): Promise<void> {
        let lastWeek = new Date()
        lastWeek.setDate(lastWeek.getDate() - 7)
        /*         let orders = await Order.aggregate([{
                    "$lookup": {
                        "from": BillingReport.collection.name,
                        "localField": "_id",
                        "foreignField": "order",
                        "as": "billingreports"
                    }
                }, {
                    "$match": {
                        "$expr": {
                            "$gt": [
                                { "$size": "$execDates" },
                                { "$size": "$billingreports" }
                            ]
                        }
                    }
                },
                {
                    "$match": {
                        "execDates": {
                            "$gte": lastWeek
                        }
                    }
                }]) */

        let orders: Array<OrderModel> = [];
        Order.find({}, { timeout: false })
            .populate('billingReports')
            .where({ execDates: { $gte: lastWeek } })
            .where({
                "$expr": {
                    "$gt": [
                        { "$size": { "$ifNull": ["$execDates", []] } },
                        { "$size": { "$ifNull": ["$billingReports", []] } }
                    ]
                }
            })
            .cursor()
            .on('data', (data: Array<OrderModel>) => {
                orders = orders.concat(data)
            })
            .on('end', () => {
                res.send(orders)
            })
    }

    public static async put(req: Express.Request, res: Express.Response): Promise<void> {
        let creator = await User.findOne({ "_id": req.body.creatorId })
        let order = await Order.findOne({ "_id": req.body.orderId })

        let billingReport = new BillingReport({
            creator: creator,
            order: order,
            orderDate: new Date(req.body.date),
            compensations: [],
            remarks: req.body.remarks,
            food: req.body.food,
            status: 'pending'
        })


        let compensationEntries = []
        for (let i in req.body.compensationEntries) {
            let entry = req.body.compensationEntries[i]
            let member = await Contact.findOne({ "_id": i })
            let from = new Date("1970-01-01 " + entry.from)
            let until = new Date("1970-01-01 " + entry.until)
            let _0700 = new Date("1970-01-01 07:00")
            let _2100 = new Date("1970-01-01 21:00")
            let dayHours = 0
            let nightHours = 0

            if (until < from) {
                until.setDate(until.getDate() + 1)
            }

            /**
             * Payout schema:
             * 08:00 - 21:00 = 10 Bucks
             * 21:00 - 08:00 = 15 Bucks
             */
            while (true) {
                if (from < _0700 && until > _0700) {
                    nightHours += (_0700.getTime() - from.getTime()) / 1000 / 60 / 60
                    from = new Date(_0700.toString())
                }

                if (from < _0700 && until < _0700) {
                    nightHours += (until.getTime() - from.getTime()) / 1000 / 60 / 60
                    break
                }

                if (from >= _0700 && from < _2100 && until > _2100) {
                    dayHours += (_2100.getTime() - from.getTime()) / 1000 / 60 / 60
                    from = new Date(_2100.toString())
                }

                if (from >= _0700 && until <= _2100) {
                    dayHours += (until.getTime() - from.getTime()) / 1000 / 60 / 60
                    break
                }


                _0700.setDate(_0700.getDate() + 1)
                _2100.setDate(_2100.getDate() + 1)
            }


            let compensationEntry = new CompensationEntry({
                member: member,
                creator: creator,
                dayHours: dayHours,
                nightHours: nightHours,
                from: from,
                to: until,
                amount: ((dayHours * 10) + (nightHours * 15)),
                billingReport: billingReport,
                type: 'order',
                approved: false
            })
            compensationEntries.push(compensationEntry)
            compensationEntry.save()
        }

        billingReport.compensations = compensationEntries
        billingReport.save()
        res.send(billingReport)
    }

    public static async approve(req: Express.Request, res: Express.Response): Promise<void> {
        let billingReport = await BillingReport.findOne({ '_id': req.body._id })

        if (billingReport) {
            let compensations = await CompensationEntry.find({ 'billingReport': billingReport._id })
            let savePromises = []
            for (let compensation of compensations) {
                compensation.approved = true
                compensation.lastModifiedBy = req.user
                savePromises.push(compensation.save())
            }

            billingReport.status = 'approved'
            billingReport.lastModifiedBy = req.user

            Promise.all(savePromises).then(async () => {
                await (billingReport as BillingReportModel).save()
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
        let billingReport = await BillingReport.findOne({ '_id': req.body._id })
        if (billingReport) {
            for (let i of req.body) {
                //@ts-ignore
                billingReport[i] = req.body[i]
            }

            billingReport.lastModifiedBy = req.user
            await billingReport.save()
            res.send(billingReport)
        } else {
            res.status(500)
            res.send({
                message: 'sorry man...'
            })
        }
    }
}