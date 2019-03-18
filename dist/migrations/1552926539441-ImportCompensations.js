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
const CustomCompensation_1 = __importDefault(require("../entities/CustomCompensation"));
const fs_1 = __importDefault(require("fs"));
const Contact_1 = __importDefault(require("../entities/Contact"));
const User_1 = __importDefault(require("../entities/User"));
class ImportCompensations1552926539441 {
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            let manager = queryRunner.manager;
            let user = yield manager.findOneOrFail(User_1.default, 2);
            let data = fs_1.default.readFileSync('src/migrations/compensations_20190318.json');
            let parsed = JSON.parse(data.toString());
            for (let record of parsed.data) {
                try {
                    let contact = yield manager.findOneOrFail(Contact_1.default, { bexioId: record.bexioID });
                    if (!contact)
                        throw new Error('Contact not found');
                    //@ts-ignore
                    let rec = new CustomCompensation_1.default(contact, user, parseFloat(record.total), new Date(record.datum), this.genDescription(record.bemerkung, record.von, record.bis), true);
                    manager.save(CustomCompensation_1.default, rec);
                }
                catch (err) {
                    console.log(`failed with ID ${record.bexioID}`);
                    console.log(err);
                }
            }
            return;
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            let manager = queryRunner.manager;
            let data = fs_1.default.readFileSync('src/migrations/compensations_20190318.json');
            let parsed = JSON.parse(data.toString());
            for (let record of parsed.data) {
                let contact = yield manager.findOneOrFail(Contact_1.default, { bexioId: record.bexioID });
                typeorm_1.getConnection()
                    .createQueryBuilder()
                    .delete()
                    .from(CustomCompensation_1.default)
                    .where('memberId = :contact', { contact: contact.id })
                    .andWhere('amount = :amount', { amount: parseFloat(record.total) })
                    .andWhere('date = :date', { date: record.datum })
                    .andWhere('description = :desc', { desc: this.genDescription(record.bemerkung, record.von, record.bis) })
                    .execute();
            }
            return;
        });
    }
    genDescription(bemerkung, von, bis) {
        if (von && bis)
            return `${bemerkung} (${(new Date(von)).toTimeString()} - ${(new Date(bis)).toTimeString()})`;
        return bemerkung;
    }
}
exports.ImportCompensations1552926539441 = ImportCompensations1552926539441;
//# sourceMappingURL=1552926539441-ImportCompensations.js.map