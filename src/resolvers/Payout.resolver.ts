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
	Float,
	ID,
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
import Compensation from '../entities/Compensation';

const baseResolver = createResolver('Payout', Payout, [AuthRoles.PAYOUTS_READ]);

@Resolver((of) => Payout)
export default class PayoutResolver extends baseResolver {
	private emailService = new EMailService('no-reply@vkazu.ch');

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
			const member = await resolveEntity<Contact>('Contact', memberId, ['extension']);
			const email = await PayoutService.generateMemberMail(payout, member);
			const pdf = await PayoutService.generateMemberPDF(payout, member);
			const extension = await getManager()
				.getRepository(ContactExtension)
				.findOne({ where: { contact: memberId } });

			await this.emailService.sendMail(
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

	@Authorized([AuthRoles.PAYOUTS_EDIT])
	@Mutation((type) => Boolean)
	public async markAsPaied(
		@Arg('id', () => ID) id: number,
		@Arg('memberId', () => ID) memberId: number
	): Promise<boolean> {
		const compensations = await getManager()
			.getRepository(Compensation)
			.find({
				where: {
					payoutId: id,
					memberId,
				},
			});

		const promises = [];
		for (const comp of compensations) {
			comp.paied = true;
			promises.push(comp.save());
		}

		await Promise.all(promises);

		return true;
	}

	@Authorized([AuthRoles.PAYOUTS_EDIT])
	@Mutation((type) => Boolean)
	public async markAsPaiedBulk(
		@Arg('id', () => Int) id: number,
		@Arg('memberIds', () => [Int]) memberIds: number[]
	): Promise<boolean> {
		const compensations = await getManager()
			.getRepository(Compensation)
			.createQueryBuilder()
			.where(`Compensation.payoutId = :payoutId`, { payoutId: id })
			.andWhere(`Compensation.memberId IN (:memberIds)`, { memberIds })
			.getMany();

		const promises = [];
		for (const comp of compensations) {
			comp.paied = true;
			promises.push(comp.save());
		}

		await Promise.all(promises);

		return true;
	}

	@FieldResolver()
	public async compensations(@Root() object: Payout): Promise<Array<Compensation<any>>> {
		const customs: Compensation<any>[] = await resolveEntityArray<CustomCompensation>(
			'CustomCompensation',
			object.compensationIds
		);
		const orders = await resolveEntityArray<OrderCompensation>(
			'OrderCompensation',
			object.compensationIds
		);
		return customs.concat(orders);
	}

	@FieldResolver((type) => Float)
	public async total(@Root() object: Payout): Promise<number> {
		const result = await getManager()
			.getRepository(Compensation)
			.createQueryBuilder('Compensation')
			.select('SUM(amount)', 'sum')
			.where('payoutId = :payout', { payout: object.id })
			.getRawOne();
		return result?.sum || 0;
	}

	@FieldResolver()
	public async updatedBy(@Root() object: Payout): Promise<User> {
		return resolveEntity('User', object.updatedById);
	}
}
