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
const Payout_1 = __importDefault(require("../entities/Payout"));
const PayoutService_1 = __importDefault(require("../services/PayoutService"));
const Contact_1 = __importDefault(require("../entities/Contact"));
const EMailService_1 = __importDefault(require("../services/EMailService"));
class PayoutController {
    static getPayouts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.send(yield typeorm_1.getManager().getRepository(Payout_1.default).find({
                join: {
                    alias: 'payout',
                    leftJoinAndSelect: {
                        compensations: 'payout.compensations',
                        billingReport: 'compensations.billingReport',
                        member: 'compensations.member',
                        order: 'billingReport.order'
                    }
                }
            }));
        });
    }
    static createPayout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body.until) {
                res.status(402);
                res.send({
                    message: 'Invalid request (field until is missing)'
                });
            }
            let payout = new Payout_1.default(new Date(req.body.until), new Date(req.body.from));
            payout = yield typeorm_1.getManager().getRepository(Payout_1.default).save(payout);
            yield PayoutService_1.default.reclaimCompensations(payout);
            res.send(payout);
        });
    }
    static reclaim(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body.id) {
                res.status(402);
                res.send({
                    message: 'Invalid request (field id is missing)'
                });
            }
            const payout = yield typeorm_1.getManager().getRepository(Payout_1.default).findOne({ id: req.body.id });
            if (payout) {
                yield PayoutService_1.default.reclaimCompensations(payout);
                res.send(payout);
            }
            else {
                res.status(500);
                res.send({
                    message: 'sorry man...'
                });
            }
        });
    }
    static generateMemberPDF(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const payoutId = req.body.payoutId || req.params.payout;
            const memberId = req.body.memberId || req.params.member;
            if (!payoutId || !memberId) {
                res.status(402);
                res.send({
                    message: 'Invalid request (field payoutId or memberId is missing)'
                });
            }
            else {
                res.contentType('application/pdf');
                res.send((yield PayoutService_1.default.generateMemberPDF(yield typeorm_1.getManager().getRepository(Payout_1.default).findOneOrFail(payoutId), yield typeorm_1.getManager().getRepository(Contact_1.default).findOneOrFail(memberId))));
            }
            res.end();
        });
    }
    static generateMemberHTML(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body.hasOwnProperty('payoutId') || !req.body.hasOwnProperty('memberId')) {
                res.status(402);
                res.send({
                    message: 'Invalid request (field payoutId or memberId is missing)'
                });
            }
            else {
                res.contentType('application/pdf');
                res.send((yield PayoutService_1.default.generateMemberHTML(yield typeorm_1.getManager().getRepository(Payout_1.default).findOneOrFail(req.body.payoutId), yield typeorm_1.getManager().getRepository(Contact_1.default).findOneOrFail(req.body.memberId))).toString());
            }
            res.end();
        });
    }
    static generatePayoutPDF(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.params.hasOwnProperty('payout')) {
                res.status(402);
                res.send({
                    message: 'Invalid request (parameter payout is missing)'
                });
            }
            else {
                res.contentType('application/pdf');
                // TODO: Implement PDF
            }
            res.end();
        });
    }
    static sendMails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body.hasOwnProperty('payoutId')) {
                res.status(402);
                res.send({
                    message: 'Invalid request (field payoutId is missing)'
                });
            }
            else {
                const payout = yield typeorm_1.getManager().getRepository(Payout_1.default).findOneOrFail(req.body.payoutId);
                let memberIds;
                let sendingPromises = [];
                if (req.body.hasOwnProperty('memberIds')) {
                    memberIds = req.body.memberIds;
                }
                else {
                    memberIds = [];
                    payout.compensations.map(comp => {
                        if (memberIds.indexOf(comp.member.id) < 0)
                            memberIds.push(comp.member.id);
                    });
                }
                for (const memberId of memberIds) {
                    sendingPromises.push(new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                        const member = yield typeorm_1.getManager().getRepository(Contact_1.default).findOneOrFail(memberId);
                        const email = yield PayoutService_1.default.generateMemberMail(payout, member);
                        const pdf = yield PayoutService_1.default.generateMemberPDF(payout, member);
                        yield PayoutController.emailService.sendMail(member.mail, 'info@vkazu.ch', 'Abrechnung Verkehrskadetten-Entschädigung', email, [
                            {
                                filename: `Verkehrskadetten-Entschädigung ${member.lastname} ${member.firstname}.pdf`,
                                content: pdf
                            }
                        ]);
                        resolve();
                    })));
                }
                yield Promise.all(sendingPromises);
                res.contentType('application/json');
                res.send({ success: true });
            }
            res.end();
        });
    }
}
PayoutController.emailService = new EMailService_1.default('no-reply@vkazu.ch');
exports.default = PayoutController;
//# sourceMappingURL=PayoutController.js.map