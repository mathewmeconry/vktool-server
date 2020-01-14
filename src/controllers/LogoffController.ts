import * as Express from 'express'
import { getManager, FindManyOptions, IsNull } from "typeorm"
import Logoff from "../entities/Logoff"
import { AuthRoles } from "../interfaces/AuthRoles"
import AuthService from "../services/AuthService"
import Contact from '../entities/Contact'

export default class LogoffController {
    public static async getAll(req: Express.Request, res: Express.Response): Promise<void> {
        const options: FindManyOptions<Logoff> = {
            join: {
                alias: 'logoff',
                leftJoinAndSelect: {
                    contact: 'logoff.contact',
                    user: 'logoff.createdBy'
                }
            },
            where: {
                deletedAt: IsNull()
            }
        }
        if (!AuthService.isAuthorized(req.user.roles, AuthRoles.LOGOFFS_READ)) {
            options.where = {
                ...(options.where as object),
                contact: (req.user.bexioContact || { id: - 1 }).id
            }
        }
        res.send(await getManager().getRepository(Logoff).find(options))
    }

    public static async add(req: Express.Request, res: Express.Response): Promise<void> {
        const { contact, from, until, remarks } = req.body
        const contactObj = await getManager().getRepository(Contact).findOne({ id: contact })
        const fromDate = new Date(from)
        const untilDate = new Date(until)
        const approved = AuthService.isAuthorized(req.user.roles, AuthRoles.LOGOFFS_APPROVE)

        if (!contactObj || !from || !until || isNaN(fromDate.getTime()) || isNaN(untilDate.getTime())) {
            res.status(500)
            res.send({
                message: 'sorry man...'
            })
            return
        }

        const logoff = new Logoff(contactObj, fromDate, untilDate, approved, remarks, req.user)
        await logoff.save()

        res.send(logoff)
    }

    public static async addBulk(req: Express.Request, res: Express.Response): Promise<void> {
        const approved = AuthService.isAuthorized(req.user.roles, AuthRoles.LOGOFFS_APPROVE)
        const { contact, logoffs } = req.body
        const contactObj = await getManager().getRepository(Contact).findOne({ id: contact }, {
            join: {
                alias: 'logoff',
                leftJoinAndSelect: {
                    contact: 'logoff.contact',
                    user: 'logoff.createdBy'
                }
            },
            where: {
                deletedAt: IsNull()
            }
        })

        if (!contactObj) {
            res.status(500)
            res.send({
                message: 'sorry man...'
            })
            return
        }

        for (const dates of logoffs) {
            const { from, until } = dates
            if (isNaN((new Date(from)).getTime()) || isNaN((new Date(until)).getTime())) {
                res.status(500)
                res.send({
                    message: 'sorry man...'
                })
                return
            }
        }

        const savePromises = []
        for (const logoff of logoffs) {
            const { from, until, remarks } = logoff
            const logoffObj = new Logoff(contactObj, new Date(from), new Date(until), approved, remarks, req.user)
            savePromises.push(logoffObj.save())
        }

        res.send(await Promise.all(savePromises))
    }

    public static async approve(req: Express.Request, res: Express.Response): Promise<void> {
        const logoff = await getManager().getRepository(Logoff).findOne({ id: req.body.id, deletedAt: IsNull() }, {
            join: {
                alias: 'logoff',
                leftJoinAndSelect: {
                    contact: 'logoff.contact',
                    user: 'logoff.createdBy'
                }
            }
        })
        if (!logoff) {
            res.status(500)
            res.send({
                message: 'sorry man...'
            })
            return
        }

        logoff.approved = true
        await logoff.save()

        res.send(logoff)
    }

    public static async delete(req: Express.Request, res: Express.Response): Promise<void> {
        const logoffId = req.params.logoff || req.query.logoff

        const logoff = await getManager().getRepository(Logoff).findOne({ id: logoffId, deletedAt: IsNull() }, {
            join: {
                alias: 'logoff',
                leftJoinAndSelect: {
                    contact: 'logoff.contact',
                    user: 'logoff.createdBy'
                }
            }
        })
        if (!logoff) {
            res.status(500)
            res.send({
                message: 'sorry man...'
            })
            return
        }

        logoff.deletedAt = new Date()
        logoff.deletedBy = req.user
        await logoff.save()

        res.send(logoff)
    }
}