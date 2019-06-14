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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Compensation_1 = __importDefault(require("../entities/Compensation"));
const typeorm_1 = require("typeorm");
const CompensationService_1 = __importDefault(require("./CompensationService"));
const tea_school_1 = require("tea-school");
const path = __importStar(require("path"));
const fs_1 = __importDefault(require("fs"));
const pug = __importStar(require("pug"));
const node_sass_1 = __importDefault(require("node-sass"));
const moment_1 = __importDefault(require("moment"));
const config = require("config");
class PayoutService {
    static reclaimCompensations(payout) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!payout.id)
                throw new Error('Payout has first to be saved');
            let qb = typeorm_1.getManager().getRepository(Compensation_1.default).createQueryBuilder('compensation');
            yield qb.update().set({ payout: null }).where('payout = :payout', { payout: payout.id }).execute();
            let query = qb.update()
                .set({
                payout: payout
            })
                .where('payout is NULL')
                .andWhere('date <= :dateUntil', { dateUntil: payout.until })
                .andWhere('date >= :dateFrom', { dateFrom: payout.from })
                .andWhere('approved = 1')
                .andWhere('deletedAt is NULL');
            yield query.execute();
        });
    }
    static generateMemberPDF(payout, member) {
        return __awaiter(this, void 0, void 0, function* () {
            const compensations = (yield CompensationService_1.default.getByPayoutAndMember(payout.id, member.id)).sort((a, b) => (a.date > b.date) ? 1 : -1);
            const compensationTotal = compensations.reduce((a, b) => { return { amount: a.amount + b.amount }; }, { amount: 0 }).amount;
            return new Promise((resolve, reject) => {
                fs_1.default.readFile(path.resolve(__dirname, '../../public/logo.png'), (err, data) => __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        reject(err);
                        return;
                    }
                    const options = {
                        htmlTemplatePath: path.resolve(__dirname, '../../public/pdfs/pugs/memberPayout.pug'),
                        styleOptions: {
                            file: path.resolve(__dirname, '../../public/pdfs/scss/memberPayout.scss')
                        },
                        htmlTemplateOptions: {
                            location: 'Wallisellen',
                            date: moment_1.default(new Date()).format('DD.MM.YYYY'),
                            from: (payout.from > new Date('1970-01-01')) ? moment_1.default(payout.from).format('DD.MM.YYYY') : '',
                            until: moment_1.default(payout.until).format('DD.MM.YYYY'),
                            total: compensationTotal,
                            member,
                            compensations
                        },
                        pdfOptions: {
                            printBackground: true,
                            displayHeaderFooter: true,
                            headerTemplate: pug.renderFile(path.resolve(__dirname, '../../public/pdfs/pugs/header.pug'), { logo: `data:image/png;base64,${data.toString('base64')}` }),
                            footerTemplate: pug.renderFile(path.resolve(__dirname, '../../public/pdfs/pugs/footer.pug')),
                            format: 'A4',
                            margin: {
                                top: '25mm',
                                left: '0',
                                bottom: '25mm',
                                right: '0'
                            }
                        }
                    };
                    resolve(yield tea_school_1.generatePdf(options));
                }));
            });
        });
    }
    static generateMemberHTML(payout, member) {
        return __awaiter(this, void 0, void 0, function* () {
            const compensations = yield CompensationService_1.default.getByPayoutAndMember(payout.id, member.id);
            const compensationTotal = compensations.reduce((a, b) => { return { amount: a.amount + b.amount }; }, { amount: 0 }).amount;
            return pug.renderFile(path.resolve(__dirname, '../../public/pdfs/pugs/memberPayout.pug'), {
                location: 'Wallisellen',
                date: moment_1.default(new Date()).format('DD.MM.YYYY'),
                until: moment_1.default(payout.until).format('DD.MM.YYYY'),
                compiledStyle: node_sass_1.default.renderSync({ file: path.resolve(__dirname, '../../public/pdfs/scss/memberPayout.scss') }).css,
                total: compensationTotal,
                member,
                compensations
            });
        });
    }
    static generateMemberMail(payout, member) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fs_1.default.readFile(path.resolve(__dirname, '../../public/logo.png'), (err, data) => __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(pug.renderFile(path.resolve(__dirname, '../../public/emails/memberPayout/memberPayout.pug'), {
                        apiEndpoint: config.get('apiEndpoint'),
                        compiledStyle: node_sass_1.default.renderSync({ file: path.resolve(__dirname, '../../public/emails/memberPayout/memberPayout.scss') }).css,
                        member
                    }));
                }));
            });
        });
    }
}
exports.default = PayoutService;
//# sourceMappingURL=PayoutService.js.map