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
class Payouts1559315340653 {
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query("ALTER TABLE `payout` DROP COLUMN `date`");
            yield queryRunner.query("ALTER TABLE `payout` ADD `until` date NOT NULL");
            yield queryRunner.query("ALTER TABLE `payout` ADD `from` date NOT NULL");
            yield queryRunner.query("ALTER TABLE `payout` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
            yield queryRunner.query("ALTER TABLE `compensation` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
            yield queryRunner.query("ALTER TABLE `compensation` CHANGE `dayHours` `dayHours` float NULL");
            yield queryRunner.query("ALTER TABLE `compensation` CHANGE `nightHours` `nightHours` float NULL");
            yield queryRunner.query("ALTER TABLE `contact_type` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
            yield queryRunner.query("ALTER TABLE `contact_group` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
            yield queryRunner.query("ALTER TABLE `collection_point` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
            yield queryRunner.query("ALTER TABLE `contact_extension` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
            yield queryRunner.query("ALTER TABLE `contact` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
            yield queryRunner.query("ALTER TABLE `user` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
            yield queryRunner.query("ALTER TABLE `user` CHANGE `lastLogin` `lastLogin` timestamp(6) NOT NULL");
            yield queryRunner.query("ALTER TABLE `position` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
            yield queryRunner.query("ALTER TABLE `order` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
            yield queryRunner.query("ALTER TABLE `billing_report` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query("ALTER TABLE `billing_report` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
            yield queryRunner.query("ALTER TABLE `order` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
            yield queryRunner.query("ALTER TABLE `position` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
            yield queryRunner.query("ALTER TABLE `user` CHANGE `lastLogin` `lastLogin` timestamp(6) NOT NULL DEFAULT ''0000-00-00 00:00:00.000000''");
            yield queryRunner.query("ALTER TABLE `user` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
            yield queryRunner.query("ALTER TABLE `contact` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
            yield queryRunner.query("ALTER TABLE `contact_extension` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
            yield queryRunner.query("ALTER TABLE `collection_point` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
            yield queryRunner.query("ALTER TABLE `contact_group` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
            yield queryRunner.query("ALTER TABLE `contact_type` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
            yield queryRunner.query("ALTER TABLE `compensation` CHANGE `nightHours` `nightHours` float(12) NULL");
            yield queryRunner.query("ALTER TABLE `compensation` CHANGE `dayHours` `dayHours` float(12) NULL");
            yield queryRunner.query("ALTER TABLE `compensation` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
            yield queryRunner.query("ALTER TABLE `payout` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
            yield queryRunner.query("ALTER TABLE `payout` DROP COLUMN `from`");
            yield queryRunner.query("ALTER TABLE `payout` DROP COLUMN `until`");
            yield queryRunner.query("ALTER TABLE `payout` ADD `date` date NOT NULL");
        });
    }
}
exports.Payouts1559315340653 = Payouts1559315340653;
//# sourceMappingURL=1559315340653-Payouts.js.map