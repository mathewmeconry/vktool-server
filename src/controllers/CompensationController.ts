import Contact from "../entities/Contact";
import * as Express from 'express'
import AuthService from "../services/AuthService";
import { AuthRoles } from "../interfaces/AuthRoles";
import { getManager } from "typeorm";
import Compensation from "../entities/Compensation";
import CustomCompensation from "../entities/CustomCompensation";

export default class CompensationController {
    public static async getAll(req: Express.Request, res: Express.Response): Promise<void> {
        res.send(await getManager().getRepository(Compensation).find())
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
                console.error(err)
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