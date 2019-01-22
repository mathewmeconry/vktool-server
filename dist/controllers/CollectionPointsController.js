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
const CollectionPoint_1 = __importDefault(require("../entities/CollectionPoint"));
class CollectionPointsController {
    static getCollectionPoints(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.send(yield typeorm_1.getManager().getRepository(CollectionPoint_1.default).find({}));
        });
    }
    static addCollectionPoint(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let collectionPoint = new CollectionPoint_1.default(req.body.address, req.body.postcode, req.body.city);
            yield typeorm_1.getManager().getRepository(CollectionPoint_1.default).save(collectionPoint);
            res.send(collectionPoint);
        });
    }
}
exports.default = CollectionPointsController;
//# sourceMappingURL=CollectionPointsController.js.map