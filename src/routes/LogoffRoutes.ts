import * as Express from 'express';
import { AuthRoles } from '../interfaces/AuthRoles';
import AuthService from '../services/AuthService';
import LogoffsController from '../controllers/LogoffsController'

export default function LogoffRoutes(app: Express.Router) {
    app.get('/logoffs/excel', AuthService.checkAuthorization([AuthRoles.LOGOFFS_READ]), LogoffsController.getExcelExport)
}
