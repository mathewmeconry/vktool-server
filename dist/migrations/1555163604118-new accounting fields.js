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
class newAccountingFields1555163604118 {
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query("ALTER TABLE `contact_extension` ADD `bankName` text NULL");
            yield queryRunner.query("ALTER TABLE `contact_extension` ADD `iban` text NULL");
            yield queryRunner.query("ALTER TABLE `contact_extension` ADD `accountHolder` text NULL");
            yield queryRunner.query("ALTER TABLE `payout` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
            yield queryRunner.query("ALTER TABLE `compensation` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
            yield queryRunner.query("ALTER TABLE `contact_type` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
            yield queryRunner.query("ALTER TABLE `contact_group` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
            yield queryRunner.query("ALTER TABLE `collection_point` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
            yield queryRunner.query("ALTER TABLE `contact_extension` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
            yield queryRunner.query("ALTER TABLE `contact` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
            yield queryRunner.query("ALTER TABLE `user` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
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
            yield queryRunner.query("ALTER TABLE `user` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
            yield queryRunner.query("ALTER TABLE `contact` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
            yield queryRunner.query("ALTER TABLE `contact_extension` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
            yield queryRunner.query("ALTER TABLE `collection_point` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
            yield queryRunner.query("ALTER TABLE `contact_group` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
            yield queryRunner.query("ALTER TABLE `contact_type` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
            yield queryRunner.query("ALTER TABLE `compensation` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
            yield queryRunner.query("ALTER TABLE `payout` CHANGE `updatedAt` `updatedAt` timestamp(6) NULL DEFAULT 'current_timestamp(6)'");
            yield queryRunner.query("ALTER TABLE `contact_extension` DROP COLUMN `accountHolder`");
            yield queryRunner.query("ALTER TABLE `contact_extension` DROP COLUMN `iban`");
            yield queryRunner.query("ALTER TABLE `contact_extension` DROP COLUMN `bankName`");
        });
    }
}
exports.newAccountingFields1555163604118 = newAccountingFields1555163604118;
//# sourceMappingURL=1555163604118-new accounting fields.js.map