import { getManager } from "typeorm";
import OrderCompensation from "../entities/OrderCompensation";
import CustomCompensation from "../entities/CustomCompensation";

export default class CompensationService {
    public static async getAll(): Promise<Array<OrderCompensation | CustomCompensation>> {
        let data = await Promise.all<Array<OrderCompensation | CustomCompensation>>([
            CompensationService.getOrderQuery().getMany(),
            CompensationService.getCustomQuery().getMany()
        ])

        return data[0].concat(data[1]).sort((a, b) => (a.date > b.date) ? 1 : -1)
    }

    public static async getByMember(memberId: number): Promise<Array<OrderCompensation | CustomCompensation>> {
        let data = await Promise.all<Array<OrderCompensation | CustomCompensation>>([
            CompensationService.getOrderQuery().andWhere('memberId = :memberId', { memberId }).getMany(),
            CompensationService.getCustomQuery().andWhere('memberId = :memberId', { memberId }).getMany()
        ])

        return data[0].concat(data[1]).sort((a, b) => (a.date > b.date) ? 1 : -1)
    }

    public static async getByPayoutAndMember(payoutId: number, memberId: number): Promise<Array<OrderCompensation | CustomCompensation>> {
        let data = await Promise.all<Array<OrderCompensation | CustomCompensation>>([
            CompensationService.getOrderQuery().andWhere('payoutId = :payoutId', { payoutId }).andWhere('memberId = :memberId', { memberId }).getMany(),
            CompensationService.getCustomQuery().andWhere('payoutId = :payoutId', { payoutId }).andWhere('memberId = :memberId', { memberId }).getMany()
        ])

        return data[0].concat(data[1]).sort((a, b) => (a.date > b.date) ? 1 : -1)
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
                'compensation.valutaDate',
                'compensation.from',
                'compensation.until'
            ])
            .leftJoinAndSelect('compensation.member', 'member')
            .leftJoinAndSelect('compensation.creator', 'creator')
            .leftJoinAndSelect('compensation.payout', 'payout')
            .leftJoinAndSelect('compensation.billingReport', 'billingReport')
            .leftJoinAndSelect('billingReport.order', 'order')
            .leftJoinAndSelect('order.contact', 'contact')
            .where('deletedAt IS NULL')
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
                'compensation.valutaDate'
            ])
            .leftJoinAndSelect('compensation.member', 'member')
            .leftJoinAndSelect('compensation.creator', 'creator')
            .leftJoinAndSelect('compensation.payout', 'payout')
            .where('deletedAt IS NULL')
    }
}