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
const BexioService_1 = require("./services/BexioService");
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const yargs_1 = __importDefault(require("yargs"));
const CliController_1 = __importDefault(require("./controllers/CliController"));
function conntectDB() {
    return __awaiter(this, void 0, void 0, function* () {
        let connectionOptions = yield typeorm_1.getConnectionOptions();
        // @ts-ignore
        if (process.env.NODE_ENV === 'production')
            connectionOptions['ssl'] = true;
        yield typeorm_1.createConnection(connectionOptions);
        yargs_1.default
            .command({
            command: ['server', 'srv', 'run', 'up', '$0'],
            describe: 'start up the server',
            handler: CliController_1.default.startServer
        });
        BexioService_1.BexioService.addCommandline(yargs_1.default);
        yargs_1.default.argv;
    });
}
conntectDB();
//# sourceMappingURL=index.js.map