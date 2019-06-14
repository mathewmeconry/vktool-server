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
const CompensationService_1 = __importDefault(require("../services/CompensationService"));
class CompensationController {
    static getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.send(yield CompensationService_1.default.getAll());
        });
    }
    static getUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.send(yield CompensationService_1.default.getByMember(parseInt(req.params.member)));
        });
    }
    static add(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let member = yield typeorm_1.getManager().getRepository(Contact_1.default).findOneOrFail({ id: req.body.member });
            if (member) {
                let entry = new CustomCompensation_1.default(member, req.user, req.body.amount, new Date(req.body.date), req.body.description, AuthService_1.default.isAuthorized(req.user.roles, AuthRoles_1.AuthRoles.COMPENSATIONS_APPROVE));
                entry.updatedBy = req.user;
                entry.save().then((entry) => {
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
                return;
            }
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
                    promises.push(compensationEntry.save());
                }
                billingReport.updatedBy = req.user;
                yield billingReport.save();
                let dbCompensations = yield Promise.all(promises);
                res.status(200);
                res.send(dbCompensations);
            }
            else {
                res.status(500);
                res.send({
                    message: 'sorry man...'
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
                yield compensation.save();
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
                yield compensation.save();
                if (compensation instanceof OrderCompensation_1.default) {
                    let billingReport = yield typeorm_1.getManager().getRepository(BillingReport_1.default).createQueryBuilder('billingReport').where('id = :id', { id: compensation.billingReportId }).getOne();
                    if (billingReport) {
                        billingReport.updatedBy = req.user;
                        yield billingReport.save();
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