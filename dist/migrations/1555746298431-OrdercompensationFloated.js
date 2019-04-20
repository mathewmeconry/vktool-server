"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class OrdercompensationFloated1555746298431 {
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query("ALTER TABLE `compensation` DROP COLUMN `dayHours`");
            yield queryRunner.query("ALTER TABLE `compensation` ADD `dayHours` float NULL");
            yield queryRunner.query("ALTER TABLE `compensation` DROP COLUMN `nightHours`");
            yield queryRunner.query("ALTER TABLE `compensation` ADD `nightHours` float NULL");
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query("ALTER TABLE `compensation` DROP COLUMN `nightHours`");
            yield queryRunner.query("ALTER TABLE `compensation` ADD `nightHours` int NULL DEFAULT '0'");
            yield queryRunner.query("ALTER TABLE `compensation` DROP COLUMN `dayHours`");
            yield queryRunner.query("ALTER TABLE `compensation` ADD `dayHours` int NULL DEFAULT '0'");
        });
    }
}
exports.OrdercompensationFloated1555746298431 = OrdercompensationFloated1555746298431;
//# sourceMappingURL=1555746298431-OrdercompensationFloated.js.map