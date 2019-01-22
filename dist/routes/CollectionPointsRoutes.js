"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuthService_1 = __importDefault(require("../services/AuthService"));
const AuthRoles_1 = require("../interfaces/AuthRoles");
const CollectionPointsController_1 = __importDefault(require("../controllers/CollectionPointsController"));
function CollectionPointsRoutes(app) {
    app.get('/api/collection-points', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.DRAFT_READ]), CollectionPointsController_1.default.getCollectionPoints);
    app.put('/api/collection-points', AuthService_1.default.checkAuthorization([AuthRoles_1.AuthRoles.DRAFT_EDIT, AuthRoles_1.AuthRoles.DRAFT_CREATE]), CollectionPointsController_1.default.addCollectionPoint);
}
exports.default = CollectionPointsRoutes;
//# sourceMappingURL=CollectionPointsRoutes.js.map