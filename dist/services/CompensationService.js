"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const OrderCompensation_1 = __importDefault(require("../entities/OrderCompensation"));
const CustomCompensation_1 = __importDefault(require("../entities/CustomCompensation"));
class CompensationService {
    static getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield Promise.all([
                CompensationService.getOrderQuery().getMany(),
                CompensationService.getCustomQuery().getMany()
            ]);
            return data[0].concat(data[1]);
        });
    }
    static getByMember(memberId) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield Promise.all([
                CompensationService.getOrderQuery().andWhere('memberId = :memberId', { memberId }).getMany(),
                CompensationService.getCustomQuery().andWhere('memberId = :memberId', { memberId }).getMany()
            ]);
            return data[0].concat(data[1]);
        });
    }
    static getByPayoutAndMember(payoutId, memberId) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield Promise.all([
                CompensationService.getOrderQuery().andWhere('payoutId = :payoutId', { payoutId }).andWhere('memberId = :memberId', { memberId }).getMany(),
                CompensationService.getCustomQuery().andWhere('payoutId = :payoutId', { payoutId }).andWhere('memberId = :memberId', { memberId }).getMany()
            ]);
            return data[0].concat(data[1]);
        });
    }
    static getOrderQuery() {
        return typeorm_1.getManager()
            .getRepository(OrderCompensation_1.default)
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
            .where('deletedAt IS NULL');
    }
    static getCustomQuery() {
        return typeorm_1.getManager()
            .getRepository(CustomCompensation_1.default)
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
            .where('deletedAt IS NULL');
    }
}
exports.default = CompensationService;
//# sourceMappingURL=CompensationService.js.map