import * as Express from 'express'
import AuthService from "../services/AuthService"
import { AuthRoles } from "../interfaces/AuthRoles"
import LogoffController from "../controllers/LogoffController"

export default function LogoffRoutes(app: Express.Router) {
    app.get('/logoffs', AuthService.checkAuthorization([AuthRoles.AUTHENTICATED]), LogoffController.getAll)

    app.put('/logoffs/add', AuthService.checkAuthorization([AuthRoles.LOGOFFS_CREATE]), LogoffController.add)
    app.put('/logoffs/add/bulk', AuthService.checkAuthorization([AuthRoles.LOGOFFS_CREATE]), LogoffController.addBulk)

    app.post('/logoffs/approve', AuthService.checkAuthorization([AuthRoles.LOGOFFS_APPROVE]), LogoffController.approve)

    app.delete('/logoffs', AuthService.checkAuthorization([AuthRoles.LOGOFFS_EDIT]), LogoffController.delete)
    app.delete('/logoffs/:logoff', AuthService.checkAuthorization([AuthRoles.LOGOFFS_EDIT]), LogoffController.delete)
}