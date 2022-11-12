import * as Express from 'express';
import AuthService from '../services/AuthService';
import { AuthRoles } from '../interfaces/AuthRoles';
import BillingReportService from '../services/BillingReportService';

export default function BillingReportRoutes(app: Express.Router) {
	app.get(
		'/billing-report/receipt/:id/pdf',
		AuthService.checkAuthorization([
			AuthRoles.BILLINGREPORTS_CREATE,
			AuthRoles.BILLINGREPORTS_EDIT,
		]),
		BillingReportService.getReceipt
	);
}
