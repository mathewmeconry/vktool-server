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
const Contact_1 = __importDefault(require("../entities/Contact"));
const AuthService_1 = __importDefault(require("../services/AuthService"));
const AuthRoles_1 = require("../interfaces/AuthRoles");
const typeorm_1 = require("typeorm");
const Compensation_1 = __importDefault(require("../entities/Compensation"));
const CustomCompensation_1 = __importDefault(require("../entities/CustomCompensation"));
const BillingReport_1 = __importDefault(require("../entities/BillingReport"));
const OrderCompensation_1 = __importDefault(require("../entities/OrderCompensation"));
class CompensationController {
    static getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            Promise.all([
                typeorm_1.getManager()
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
                    .leftJoinAndSelect('compensation.billingReport', 'billingReport')
                    .leftJoinAndSelect('billingReport.order', 'order')
                    .where('deletedAt IS NULL')
                    .getMany(),
                typeorm_1.getManager()
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
                    .where('deletedAt IS NULL')
                    .getMany()
            ]).then(data => {
                res.send(data[0].concat(data[1]));
            });
        });
    }
    static getUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.send(yield typeorm_1.getManager().getRepository(Compensation_1.default).find({ memberId: parseInt(req.params.member), deletedAt: typeorm_1.IsNull() }));
        });
    }
    static add(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let member = yield typeorm_1.getManager().getRepository(Contact_1.default).findOneOrFail({ id: req.body.member });
            if (member) {
                let entry = new CustomCompensation_1.default(member, req.user, req.body.amount, new Date(req.body.date), req.body.description, AuthService_1.default.isAuthorized(req, AuthRoles_1.AuthRoles.COMPENSATIONS_APPROVE));
                entry.updatedBy = req.user;
                typeorm_1.getManager().getRepository(Compensation_1.default).save(entry).then(() => {
                    res.send(entry);
                }).catch((err) => {
                    res.status(500);
                    res.send({
                        message: 'sorry man...'
                    });
                });
            }
            else {
                res.status(500);
                res.send({ message: 'Sorry man...' });
            }
        });
    }
    static addBulk(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body.hasOwnProperty('billingReportId') && !req.user.roles.includes(AuthRoles_1.AuthRoles.COMPENSATIONS_CREATE)) {
                res.status(403);
                res.send({
                    error: 'Not authorized'
                });
            }
            else {
                let billingReport = undefined;
                let contactRepo = typeorm_1.getManager().getRepository(Contact_1.default);
                let promises = [];
                if (req.body.hasOwnProperty('billingReportId')) {
                    billingReport = yield typeorm_1.getManager().getRepository(BillingReport_1.default).createQueryBuilder('billingReport').where('id = :id', { id: req.body.billingReportId }).getOne();
                }
                if (billingReport) {
                    for (let entry of req.body.entries) {
                        let member = yield contactRepo.findOneOrFail({ id: entry.id });
                        let compensationEntry = new OrderCompensation_1.default(member, req.user, billingReport.date, billingReport, new Date(entry.from), new Date(entry.until), 0, 0, entry.charge, (billingReport.state === 'approved') ? true : false);
                        promises.push(typeorm_1.getManager().getRepository(OrderCompensation_1.default).save(compensationEntry));
                    }
                    billingReport.updatedBy = req.user;
                    yield typeorm_1.getManager().getRepository(BillingReport_1.default).save(billingReport);
                }
                else {
                    for (let entry of req.body.entries) {
                        let member = yield contactRepo.findOneOrFail({ id: parseInt(entry.id) });
                        let compensationEntry = new CustomCompensation_1.default(member, req.user, entry.amount, entry.date, entry.description);
                        promises.push(typeorm_1.getManager().getRepository(CustomCompensation_1.default).save(compensationEntry));
                    }
                }
                yield Promise.all(promises);
                res.status(200);
                res.send({
                    success: true
                });
            }
        });
    }
    static approve(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let compensationRepo = typeorm_1.getManager().getRepository(Compensation_1.default);
            let compensation = yield compensationRepo.createQueryBuilder().where('id = :id', { id: req.body.id }).getOne();
            if (compensation) {
                compensation.approved = true;
                compensation.approvedBy = req.user;
                compensation.updatedBy = req.user;
                yield compensationRepo.save(compensation);
                res.send({ success: true });
            }
            else {
                res.status(500);
                res.send({
                    message: 'sorry man...'
                });
            }
        });
    }
    static delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let compensationRepo = typeorm_1.getManager().getRepository(Compensation_1.default);
            let compensation = yield compensationRepo.createQueryBuilder().where('id = :id', { id: req.body.id }).getOne();
            if (compensation) {
                compensation.deletedAt = new Date();
                compensation.deletedBy = req.user;
                yield compensationRepo.save(compensation);
                if (compensation instanceof OrderCompensation_1.default) {
                    let billingReport = yield typeorm_1.getManager().getRepository(BillingReport_1.default).createQueryBuilder('billingReport').where('id = :id', { id: compensation.billingReportId }).getOne();
                    if (billingReport) {
                        billingReport.updatedBy = req.user;
                        yield typeorm_1.getManager().getRepository(BillingReport_1.default).save(billingReport);
                    }
                    else {
                        res.status(500);
                        res.send({
                            message: 'sorry man...'
                        });
                        return;
                    }
                }
                res.send(compensation);
            }
            else {
                res.status(500);
                res.send({
                    message: 'sorry man...'
                });
            }
        });
    }
}
exports.default = CompensationController;
//# sourceMappingURL=CompensationController.js.map