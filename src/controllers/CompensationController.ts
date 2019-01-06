import Contact from "../entities/Contact";
import * as Express from 'express'
import CompensationEntry from '../entities/CompensationEntry';
import { validationResult } from 'express-validator/check';
import { Types } from 'mongoose';
import BillingReport from "../entities/BillingReport";
import User from "../entities/User";
import AuthService from "../services/AuthService";
import { AuthRoles } from "../interfaces/AuthRoles";

export default class CompensationController {
    public static async getAll(req: Express.Request, res: Express.Response): Promise<void> {
        let compensations = await CompensationEntry.aggregate(
            [
                {
                    "$lookup": {
                        "from": Contact.collection.name,
                        "localField": "member",
                        "foreignField": "_id",
                        "as": "member"
                    }
                },
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
                        "from": BillingReport.collection.name,
                        "localField": "billingReport",
                        "foreignField": "_id",
                        "as": "billingReport"
                    }
                },
                { "$unwind": "$member" },
                { "$unwind": "$creator" }
            ])

        for (let entry of compensations) {
            if (entry.type === 'order') {
                entry.amount = (entry.nightHours * 15) + (entry.dayHours * 10)
                entry.date = entry.billingReport[0].orderDate
            }
        }

        res.send(compensations)
    }

    public static async getUser(req: Express.Request, res: Express.Response): Promise<void> {
        let errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(422).json({ errors: errors.array() });
            return;
        }

        let compensations = await CompensationEntry.aggregate(
            [
                {
                    "$match": { "member": new Types.ObjectId(req.params.member) }
                },
                {
                    "$lookup": {
                        "from": Contact.collection.name,
                        "localField": "member",
                        "foreignField": "_id",
                        "as": "member"
                    }
                },
                {
                    "$lookup": {
                        "from": Contact.collection.name,
                        "localField": "creator",
                        "foreignField": "_id",
                        "as": "creator"
                    }
                },
                { "$unwind": "$member" },
                { "$unwind": "$creator" }
            ])

        res.send(compensations)
    }

    public static async add(req: Express.Request, res: Express.Response): Promise<void> {
        let errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(422).json({ errors: errors.array() });
            return;
        }

        let member = await Contact.findOne({ "_id": req.body.member })
        if (member) {
            let entry = new CompensationEntry({
                member: member,
                creator: req.user,
                amount: req.body.amount,
                date: req.body.date,
                type: 'custom',
                approved: AuthService.isAuthorized(req, AuthRoles.COMPENSATIONS_APPROVE)
            })

            entry.save().then(() => {
                res.send(entry)
            }).catch(() => {
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
}