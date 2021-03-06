import { getManager } from 'typeorm';
import OrderCompensation from '../entities/OrderCompensation';
import CustomCompensation from '../entities/CustomCompensation';

export default class CompensationService {
	public static async getAll(): Promise<Array<OrderCompensation | CustomCompensation>> {
		let data = await Promise.all<Array<OrderCompensation | CustomCompensation>>([
			CompensationService.getOrderQuery().getMany(),
			CompensationService.getCustomQuery().getMany(),
		]);

		return data[0].concat(data[1]).sort((a, b) => (a.date > b.date ? 1 : -1));
	}

	public static async getByMember(
		memberId: number
	): Promise<Array<OrderCompensation | CustomCompensation>> {
		let data = await Promise.all<Array<OrderCompensation | CustomCompensation>>([
			CompensationService.getOrderQuery()
				.andWhere('compensation.memberId = :memberId', { memberId })
				.getMany(),
			CompensationService.getCustomQuery()
				.andWhere('compensation.memberId = :memberId', { memberId })
				.getMany(),
		]);

		return data[0].concat(data[1]).sort((a, b) => (a.date > b.date ? 1 : -1));
	}

	public static async getByPayout(
		payoutId: number
	): Promise<Array<OrderCompensation | CustomCompensation>> {
		let data = await Promise.all<Array<OrderCompensation | CustomCompensation>>([
			CompensationService.getOrderQuery()
				.andWhere('compensation.payoutId = :payoutId', { payoutId })
				.getMany(),
			CompensationService.getCustomQuery()
				.andWhere('compensation.payoutId = :payoutId', { payoutId })
				.getMany(),
		]);

		return data[0].concat(data[1]).sort((a, b) => (a.date > b.date ? 1 : -1));
	}

	public static async getOpenByPayout(
		payoutId: number
	): Promise<Array<OrderCompensation | CustomCompensation>> {
		let data = await Promise.all<Array<OrderCompensation | CustomCompensation>>([
			CompensationService.getOrderQuery()
				.andWhere('compensation.payoutId = :payoutId', { payoutId })
				.andWhere('compensation.paied = false')
				.getMany(),
			CompensationService.getCustomQuery()
				.andWhere('compensation.payoutId = :payoutId', { payoutId })
				.andWhere('compensation.paied = false')
				.getMany(),
		]);

		return data[0].concat(data[1]).sort((a, b) => (a.date > b.date ? 1 : -1));
	}

	public static async getByPayoutAndMember(
		payoutId: number,
		memberId: number
	): Promise<Array<OrderCompensation | CustomCompensation>> {
		let data = await Promise.all<Array<OrderCompensation | CustomCompensation>>([
			CompensationService.getOrderQuery()
				.andWhere('compensation.payoutId = :payoutId', { payoutId })
				.andWhere('compensation.memberId = :memberId', { memberId })
				.getMany(),
			CompensationService.getCustomQuery()
				.andWhere('compensation.payoutId = :payoutId', { payoutId })
				.andWhere('compensation.memberId = :memberId', { memberId })
				.getMany(),
		]);

		return data[0].concat(data[1]).sort((a, b) => (a.date > b.date ? 1 : -1));
	}

	public static async getOpenByPayoutAndMember(
		payoutId: number,
		memberId: number
	): Promise<Array<OrderCompensation | CustomCompensation>> {
		let data = await Promise.all<Array<OrderCompensation | CustomCompensation>>([
			CompensationService.getOrderQuery()
				.andWhere('compensation.payoutId = :payoutId', { payoutId })
				.andWhere('compensation.memberId = :memberId', { memberId })
				.andWhere('compensation.paied = false')
				.getMany(),
			CompensationService.getCustomQuery()
				.andWhere('compensation.payoutId = :payoutId', { payoutId })
				.andWhere('compensation.memberId = :memberId', { memberId })
				.andWhere('compensation.paied = false')
				.getMany(),
		]);

		return data[0].concat(data[1]).sort((a, b) => (a.date > b.date ? 1 : -1));
	}

	private static getOrderQuery() {
		return getManager()
			.getRepository(OrderCompensation)
			.createQueryBuilder('compensation')
			.select([
				'compensation.id',
				'compensation.amount',
				'compensation.date',
				'compensation.approved',
				'compensation.approvedBy',
				'compensation.paied',
				'compensation.from',
				'compensation.until',
				'compensation.bexioBill',
			])
			.leftJoinAndSelect('compensation.member', 'member')
			.leftJoinAndSelect('compensation.creator', 'creator')
			.leftJoinAndSelect('compensation.payout', 'payout')
			.leftJoinAndSelect('compensation.billingReport', 'billingReport')
			.leftJoinAndSelect('billingReport.order', 'order')
			.leftJoinAndSelect('order.contact', 'contact')
			.leftJoinAndSelect('compensation.transferCompensation', 'transferCompensation')
			.where('compensation.deletedAt IS NULL');
	}

	private static getCustomQuery() {
		return getManager()
			.getRepository(CustomCompensation)
			.createQueryBuilder('compensation')
			.select([
				'compensation.id',
				'compensation.description',
				'compensation.amount',
				'compensation.date',
				'compensation.approved',
				'compensation.approvedBy',
				'compensation.paied',
				'compensation.bexioBill',
			])
			.leftJoinAndSelect('compensation.member', 'member')
			.leftJoinAndSelect('compensation.creator', 'creator')
			.leftJoinAndSelect('compensation.payout', 'payout')
			.leftJoinAndSelect('compensation.transferCompensation', 'transferCompensation')
			.where('compensation.deletedAt IS NULL');
	}
}
