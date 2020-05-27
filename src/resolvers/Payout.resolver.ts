import {
	Resolver,
	Root,
	FieldResolver,
	InputType,
	Field,
	Mutation,
	Arg,
	Ctx,
	Args,
	Authorized,
	Int,
} from 'type-graphql';
import { createResolver, resolveEntity, resolveEntityArray } from './helpers';
import Payout from '../entities/Payout';
import OrderCompensation from '../entities/OrderCompensation';
import CustomCompensation from '../entities/CustomCompensation';
import User from '../entities/User';
import PayoutService from '../services/PayoutService';
import { getManager } from 'typeorm';
import Contact from '../entities/Contact';
import EMailService from '../services/EMailService';
import { ApolloContext } from '../controllers/CliController';
import { AuthRoles } from '../interfaces/AuthRoles';
import ContactExtension from '../entities/ContactExtension';

const baseResolver = createResolver('Payout', Payout, [AuthRoles.PAYOUTS_READ], ['compensations']);

@Resolver((of) => Payout)
export default class PayoutResolver extends baseResolver {
	private static emailService = new EMailService('no-reply@vkazu.ch');

	@Authorized([AuthRoles.PAYOUTS_SEND])
	@Mutation((type) => Boolean)
	public async transferPayout(
		@Arg('id', (type) => Int) id: number,
		@Arg('memberIds', (type) => [Int]) memberIds: number[],
		@Ctx() ctx: ApolloContext
	): Promise<boolean> {
		const payout = await resolveEntity<Payout>('Payout', id);
		await PayoutService.transfer(payout, memberIds, ctx.user);
		return true;
	}

	@Authorized([AuthRoles.PAYOUTS_SEND])
	@Mutation((type) => Boolean)
	public async send2Bexio(
		@Arg('id', (type) => Int) id: number,
		@Arg('memberIds', (type) => [Int], { nullable: true }) memberIds?: number[]
	): Promise<boolean> {
		const payout = await resolveEntity<Payout>('Payout', id);
		let toSendIds = memberIds;
		if (!toSendIds) {
			toSendIds = payout.compensations.map((r) => r.memberId);
		}

		for (const memberId of toSendIds) {
			const member = await resolveEntity<Contact>('Contact', memberId);
			await PayoutService.sendMemberToBexio(payout, member);
		}

		return true;
	}

	@Authorized([AuthRoles.PAYOUTS_SEND])
	@Mutation((type) => Boolean)
	public async sendPayoutMails(
		@Arg('id', (type) => Int) id: number,
		@Arg('memberIds', (type) => [Int], { nullable: true }) memberIds?: number[]
	): Promise<boolean> {
		const payout = await resolveEntity<Payout>('Payout', id);
		let toSendIds = memberIds;
		if (!toSendIds) {
			toSendIds = payout.compensations.map((r) => r.memberId);
		}

		for (const memberId of toSendIds) {
			const member = await resolveEntity<Contact>('Contact', memberId);
			const email = await PayoutService.generateMemberMail(payout, member);
			const pdf = await PayoutService.generateMemberPDF(payout, member);
			const extension = await getManager()
				.getRepository(ContactExtension)
				.findOne({ where: { contact: memberId } });

			await PayoutResolver.emailService.sendMail(
				[member.mail, member.mailSecond || '', ...(extension?.moreMails || [])],
				'info@vkazu.ch',
				'Abrechnung Verkehrskadetten-Entschädigung',
				email,
				[
					{
						filename: `Verkehrskadetten-Entschädigung ${member.lastname} ${member.firstname}.pdf`,
						content: pdf,
					},
				]
			);
		}

		return true;
	}

	@Authorized([AuthRoles.PAYOUTS_EDIT])
	@Mutation((type) => Payout)
	public async reclaimPayout(@Arg('id', (type) => Int) id: number): Promise<Payout> {
		const payout = await resolveEntity<Payout>('Payout', id);
		await PayoutService.reclaimCompensations(payout);
		const completePayout = await getManager()
			.getRepository(Payout)
			.findOne(payout.id, {
				join: {
					alias: 'payout',
					leftJoinAndSelect: {
						compensations: 'payout.compensations',
					},
				},
			});

		if (!completePayout) throw new Error('Something bad happend');
		return completePayout;
	}

	@Authorized([AuthRoles.PAYOUTS_CREATE])
	@Mutation((type) => Payout)
	public async addPayout(
		@Arg('until') until: Date,
		@Arg('from', { nullable: true }) from?: Date
	): Promise<Payout> {
		let payout = new Payout(until, from);
		payout = await payout.save();
		await PayoutService.reclaimCompensations(payout);
		const completePayout = await getManager()
			.getRepository(Payout)
			.findOne(payout.id, {
				join: {
					alias: 'payout',
					leftJoinAndSelect: {
						compensations: 'payout.compensations',
					},
				},
			});

		if (!completePayout) throw new Error('Something bad happend');
		return completePayout;
	}

	@FieldResolver()
	public async compensations(
		@Root() object: Payout
	): Promise<Array<OrderCompensation | CustomCompensation>> {
		const customs = await resolveEntityArray<CustomCompensation>(
			'CustomCompensation',
			object.compensationIds
		);
		const orders = await resolveEntityArray<OrderCompensation>(
			'OrderCompensation',
			object.compensationIds
		);
		return customs.concat(orders);
	}

	@FieldResolver()
	public async updatedBy(@Root() object: Payout): Promise<User> {
		return resolveEntity('User', object.updatedById);
	}
}
