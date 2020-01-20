import * as Express from 'express'
import { getManager, FindManyOptions, IsNull } from "typeorm"
import Logoff, { LogoffState } from "../entities/Logoff"
import { AuthRoles } from "../interfaces/AuthRoles"
import AuthService from "../services/AuthService"
import Contact from '../entities/Contact'
import LogoffService from '../services/LogoffService'

export default class LogoffController {
    public static async getAll(req: Express.Request, res: Express.Response): Promise<void> {
        const options: FindManyOptions<Logoff> = {
            join: {
                alias: 'logoff',
                leftJoinAndSelect: {
                    contact: 'logoff.contact',
                    createdBy: 'logoff.createdBy',
                    changedStateBy: 'logoff.changedStateBy'
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
        let state = req.body.state
        const { contact, from, until, remarks } = req.body
        const contactObj = await getManager().getRepository(Contact).findOne({ id: contact })
        const fromDate = new Date(from)
        const untilDate = new Date(until)

        if (!state && AuthService.isAuthorized(req.user.roles, AuthRoles.LOGOFFS_APPROVE)) state = LogoffState.APPROVED
        if (!AuthService.isAuthorized(req.user.roles, AuthRoles.LOGOFFS_APPROVE)) state = LogoffState.PENDING


        if (!contactObj || !from || !until || isNaN(fromDate.getTime()) || isNaN(untilDate.getTime())) {
            res.status(500)
            res.send({
                message: 'sorry man...'
            })
            return
        }

        const logoff = new Logoff(contactObj, fromDate, untilDate, state, remarks, req.user)
        if ([LogoffState.APPROVED, LogoffState.DECLINED].indexOf(state) > -1) logoff.changedStateBy = req.user
        await logoff.save()

        res.send(logoff)
    }

    public static async addBulk(req: Express.Request, res: Express.Response): Promise<void> {
        const { contact, logoffs } = req.body
        const isAllowedToApprove = AuthService.isAuthorized(req.user.roles, AuthRoles.LOGOFFS_APPROVE)
        const contactObj = await getManager().getRepository(Contact).findOne({ id: contact })

        if (!contactObj) {
            res.status(500)
            res.send({
                message: 'sorry man...'
            })
            return
        }

        for (const logoff of logoffs) {
            const { from, until } = logoff

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
            let state = logoff.state

            if (!state && isAllowedToApprove) state = LogoffState.APPROVED
            if (!isAllowedToApprove) state = LogoffState.PENDING

            const logoffObj = new Logoff(contactObj, new Date(from), new Date(until), state, remarks, req.user)
            if ([LogoffState.APPROVED, LogoffState.DECLINED].indexOf(state) > -1) logoffObj.changedStateBy = req.user

            savePromises.push(logoffObj.save())
        }
        const logoffsSaved = await Promise.all(savePromises)
        res.send(logoffsSaved)
        LogoffService.sendInformationMail(contact, logoffsSaved)
    }

    public static async approve(req: Express.Request, res: Express.Response): Promise<void> {
        const logoff = await getManager().getRepository(Logoff).findOne({ id: req.body.id, deletedAt: IsNull() }, {
            join: {
                alias: 'logoff',
                leftJoinAndSelect: {
                    contact: 'logoff.contact',
                    user: 'logoff.createdBy',
                    changedStateBy: 'logoff.changedStateBy'
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

        logoff.state = LogoffState.APPROVED
        logoff.changedStateBy = req.user
        await logoff.save()

        res.send(logoff)
        LogoffService.sendChangeStateMail(logoff.contact, logoff)
    }

    public static async decline(req: Express.Request, res: Express.Response): Promise<void> {
        const logoff = await getManager().getRepository(Logoff).findOne({ id: req.body.id, deletedAt: IsNull() }, {
            join: {
                alias: 'logoff',
                leftJoinAndSelect: {
                    contact: 'logoff.contact',
                    user: 'logoff.createdBy',
                    changedStateBy: 'logoff.changedStateBy'
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

        logoff.state = LogoffState.DECLINED
        logoff.changedStateBy = req.user
        await logoff.save()

        res.send(logoff)
        LogoffService.sendChangeStateMail(logoff.contact, logoff)
    }

    public static async delete(req: Express.Request, res: Express.Response): Promise<void> {
        const logoffId = req.params.logoff || req.query.logoff

        const logoff = await getManager().getRepository(Logoff).findOne({ id: logoffId, deletedAt: IsNull() }, {
            join: {
                alias: 'logoff',
                leftJoinAndSelect: {
                    contact: 'logoff.contact',
                    user: 'logoff.createdBy',
                    changedStateBy: 'logoff.changedStateBy'
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