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
class CompensationController {
    static getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.send(yield typeorm_1.getManager()
                .getRepository(Compensation_1.default)
                .createQueryBuilder('compensation')
                .leftJoinAndSelect('compensation.member', 'member')
                .leftJoinAndSelect('compensation.creator', 'creator')
                .leftJoinAndSelect('compensation.billingReport', 'billingReport')
                .leftJoinAndSelect('billingReport.order', 'order')
                .getMany());
        });
    }
    static getUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.send(yield typeorm_1.getManager().getRepository(Compensation_1.default).find({ member: req.params.member }));
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
                    console.error(err);
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
    static approve(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let compensationRepo = typeorm_1.getManager().getRepository(Compensation_1.default);
            let compensation = yield compensationRepo.findOne(req.body.id);
            if (compensation) {
                compensation.approved = true;
                compensation.approvedBy = req.user;
                compensation.updatedBy = req.user;
                yield compensationRepo.save(compensation);
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