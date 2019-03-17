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
const BillingReport_1 = __importDefault(require("../entities/BillingReport"));
const Contact_1 = __importDefault(require("../entities/Contact"));
const Order_1 = __importDefault(require("../entities/Order"));
const User_1 = __importDefault(require("../entities/User"));
const typeorm_1 = require("typeorm");
const OrderCompensation_1 = __importDefault(require("../entities/OrderCompensation"));
const AuthService_1 = __importDefault(require("../services/AuthService"));
const AuthRoles_1 = require("../interfaces/AuthRoles");
class BillingReportController {
    static getBillingReports(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let billingReportsQuery = typeorm_1.getManager().getRepository(BillingReport_1.default)
                .createQueryBuilder('billingReport')
                .leftJoinAndSelect('billingReport.creator', 'user')
                .leftJoinAndSelect('billingReport.order', 'order')
                .leftJoinAndSelect('billingReport.compensations', 'compensations', 'compensations.deletedAt IS NULL')
                .leftJoinAndSelect('compensations.member', 'member')
                .leftJoinAndSelect('billingReport.els', 'els')
                .leftJoinAndSelect('billingReport.drivers', 'drivers');
            if (!AuthService_1.default.isAuthorized(req, AuthRoles_1.AuthRoles.BILLINGREPORTS_READ)) {
                billingReportsQuery = billingReportsQuery.where('billingReport.creator = :id', { id: req.user.id });
            }
            res.send(yield billingReportsQuery.getMany());
        });
    }
    static getOpenOrders(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let now = new Date();
            let before14Days = new Date();
            before14Days.setDate(before14Days.getDate() - 14);
            let orders = yield typeorm_1.getManager()
                .getRepository(Order_1.default)
                .createQueryBuilder('order')
                .leftJoinAndSelect('order.positions', 'position')
                .leftJoinAndSelect('order.contact', 'contact')
                .where('order.validFrom <= :date', { date: now.toISOString() })
                .getMany();
            orders = orders.filter(order => order.execDates.find(execDate => execDate >= before14Days));
            res.send(orders.filter(order => order.execDates.length >= (order.billingReports || []).length));
        });
    }
    static put(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let contactRepo = typeorm_1.getManager().getRepository(Contact_1.default);
            let billingReportRepo = typeorm_1.getManager().getRepository(BillingReport_1.default);
            let creator = yield typeorm_1.getManager().getRepository(User_1.default).findOneOrFail({ id: req.body.creatorId });
            let order = yield typeorm_1.getManager().getRepository(Order_1.default).findOneOrFail({ id: req.body.orderId });
            let els = yield contactRepo.findByIds(req.body.els.map(el => el.id));
            let drivers = yield contactRepo.findByIds(req.body.drivers.map(driver => driver.id));
            let billingReport = new BillingReport_1.default(creator, order, new Date(req.body.date), [], els, drivers, req.body.food, req.body.remarks, 'pending');
            billingReport.updatedBy = req.user;
            billingReport = yield billingReportRepo.save(billingReport);
            let compensationEntries = [];
            for (let i in req.body.compensationEntries) {
                let entry = req.body.compensationEntries[i];
                let member = yield contactRepo.findOneOrFail({ id: parseInt(i) });
                let compensationEntry = new OrderCompensation_1.default(member, creator, billingReport.date, billingReport, new Date(entry.from), new Date(entry.until), 0, 0, entry.charge);
                compensationEntry.updatedBy = req.user;
                yield typeorm_1.getManager().getRepository(OrderCompensation_1.default).save(compensationEntry);
                // reset the billing report to convert it to json (circular reference)
                //@ts-ignore
                compensationEntry.billingReport = {};
                compensationEntries.push(compensationEntry);
            }
            billingReport.compensations = compensationEntries;
            yield billingReportRepo.save(billingReport);
            res.send(billingReport);
        });
    }
    static approveDecline(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let billingReportRepo = typeorm_1.getManager().getRepository(BillingReport_1.default);
            let billingReport = yield billingReportRepo.createQueryBuilder().where('id = :id', { id: req.body.id }).getOne();
            let state = req.path.split('/')[req.path.split('/').length - 1];
            if (billingReport) {
                typeorm_1.getManager().transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                    billingReport = billingReport;
                    if (state === 'approve') {
                        yield transaction.createQueryBuilder()
                            .update(OrderCompensation_1.default)
                            .set({ approved: true, updatedBy: req.user })
                            .where('billingReport = :id', { id: billingReport.id })
                            .andWhere('deletedAt IS NULL')
                            .execute();
                    }
                    if (state === 'approve') {
                        billingReport.state = 'approved';
                    }
                    else {
                        billingReport.state = 'declined';
                    }
                    billingReport.updatedBy = req.user;
                    yield transaction.save(billingReport);
                    res.send(billingReport);
                })).catch(err => {
                    res.status(500);
                    res.send({
                        message: 'sorry man...'
                    });
                });
            }
            else {
                res.status(500);
                res.send({
                    message: 'sorry man...'
                });
            }
        });
    }
    static edit(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let billingReportRepo = typeorm_1.getManager().getRepository(BillingReport_1.default);
            let billingReport = yield billingReportRepo.createQueryBuilder('billingReport').where('id = :id', { id: req.body.id }).getOne();
            if (billingReport) {
                if (AuthService_1.default.isAuthorized(req, AuthRoles_1.AuthRoles.BILLINGREPORTS_EDIT) ||
                    (billingReport.creator.id == req.user.id && billingReport.state === 'pending')) {
                    for (let i in req.body) {
                        if (i !== 'id') {
                            //@ts-ignore
                            billingReport[i] = req.body[i];
                        }
                    }
                    billingReport.date = new Date(billingReport.date);
                    billingReport.updatedBy = req.user;
                    yield billingReportRepo.save(billingReport);
                    res.send(billingReport);
                }
                else {
                    res.status(403);
                    res.send({
                        message: 'Not Authorized'
                    });
                }
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
exports.default = BillingReportController;
//# sourceMappingURL=BillingReportController.js.map