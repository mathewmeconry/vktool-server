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
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("config"));
class EMailService {
    constructor(from) {
        this.from = from;
        this.transporter = nodemailer_1.default.createTransport({
            host: config_1.default.get('mailer.host'),
            port: 587,
            secure: false,
            auth: {
                user: config_1.default.get('mailer.user'),
                pass: config_1.default.get('mailer.pass')
            }
        });
    }
    sendMail(recipient, replyTo = this.from, subject, html, attachments = []) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.transporter.verify();
            return yield this.transporter.sendMail({
                from: this.from,
                to: recipient,
                subject: subject,
                html: html,
                replyTo,
                attachments
            });
        });
    }
}
exports.default = EMailService;
//# sourceMappingURL=EMailService.js.map