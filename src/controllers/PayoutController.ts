import * as Express from 'express';
import { getManager } from 'typeorm';
import Payout from '../entities/Payout';
import PayoutService from '../services/PayoutService';
import Contact from '../entities/Contact';
import moment from 'moment';

export default class PayoutController {
	public static async generateMemberPDF(
		req: Express.Request,
		res: Express.Response
	): Promise<void> {
		const payoutId = req.body.payoutId || req.params.payout;
		const memberId = req.body.memberId || req.params.member;

		if (!payoutId || !memberId) {
			res.status(400);
			res.send({
				message: 'Invalid request (field payoutId or memberId is missing)',
			});
			return;
		}

		const member = await getManager()
			.getRepository(Contact)
			.createQueryBuilder('Contact')
			.leftJoinAndSelect('Contact.extension', 'extension')
			.where('Contact.id = :id', { id: memberId })
			.getOne();
		if (!member) {
			res.status(400);
			res.send({
				message: `member with id ${memberId} not found`,
			});
			return;
		}

		res.contentType('application/pdf');
		res.setHeader(
			'Content-Disposition',
			`inline; filename=Verkehrskadetten-Entschädigung ${member.lastname} ${member.firstname}.pdf`
		);
		res.send(
			await PayoutService.generateMemberPDF(
				await getManager().getRepository(Payout).findOneOrFail(payoutId),
				member
			)
		);
	}

	public static async generatePayoutOverviewPDF(
		req: Express.Request,
		res: Express.Response
	): Promise<void> {
		if (!req.params.hasOwnProperty('payout')) {
			res.status(400);
			res.send({
				message: 'Invalid request (parameter payout is missing)',
			});
		} else {
			res.contentType('application/pdf');
			res.send(
				await PayoutService.generateOverviewPDF(
					await getManager()
						.getRepository(Payout)
						.findOneOrFail({
							where: {
								id: req.params.payout,
							},
							join: {
								alias: 'payout',
								leftJoinAndSelect: {
									compensations: 'payout.compensations',
									billingReport: 'compensations.billingReport',
									member: 'compensations.member',
									order: 'billingReport.order',
								},
							},
						})
				)
			);
		}

		res.end();
	}

	public static async generateXml(req: Express.Request, res: Express.Response): Promise<void> {
		const payoutId = req.body.payoutId || req.params.payout;
		const memberIds = req.body.memberIds || req.params.memberIds;

		if (!payoutId) {
			res.status(400);
			res.send({
				message: 'Invalid request (field payoutId is missing)',
			});
		} else {
			const payout = await getManager().getRepository(Payout).findOneOrFail(payoutId);

			res.contentType('application/xml');
			res.setHeader(
				'Content-Disposition',
				`attachment; filename=Entschaedigungsperiode_${
					payout.from > new Date('1970-01-01') ? moment(payout.from).format('DD-MM-YYYY') : ''
				}_-_${moment(payout.until).format('DD-MM-YYYY')}.xml`
			);
			res.send(await PayoutService.generatePainXml(payout, memberIds));
		}
	}
}
