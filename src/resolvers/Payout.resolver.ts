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

const baseResolver = createResolver('Payout', Payout);

@Resolver((of) => Payout)
export default class PayoutResolver extends baseResolver {
	private static emailService = new EMailService('no-reply@vkazu.ch');

	@Mutation((type) => Boolean)
	public async transferPayout(
		@Arg('id') id: number,
		@Arg('memberIds', (type) => [Number]) memberIds: number[],
		@Ctx() ctx: ApolloContext
	): Promise<boolean> {
		const payout = await resolveEntity<Payout>('Payout', id);
		await PayoutService.transfer(payout, memberIds, ctx.user);
		return true;
	}

	@Mutation((type) => Boolean)
	public async send2Bexio(
		@Arg('id') id: number,
		@Arg('memberIds', (type) => [Number], { nullable: true }) memberIds?: number[]
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

	@Mutation((type) => Boolean)
	public async sendMemberEmails(
		@Arg('id') id: number,
		@Arg('memberIds', (type) => [Number], { nullable: true }) memberIds?: number[]
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

			await PayoutResolver.emailService.sendMail(
				[member.mail, member.mailSecond || '', ...(member.moreMails || [])],
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

	@Mutation((type) => Payout)
	public async reclaimPayout(@Arg('id') id: number): Promise<Payout> {
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
