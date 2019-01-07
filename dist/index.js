"use strict";
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
const express = require('express');
const path_1 = __importDefault(require("path"));
const http_1 = require("http");
const BexioService_1 = require("./services/BexioService");
const bodyParser = __importStar(require("body-parser"));
const AuthRoutes_1 = __importDefault(require("./routes/AuthRoutes"));
const ContactsRoutes_1 = __importDefault(require("./routes/ContactsRoutes"));
const OrdersRoutes_1 = __importDefault(require("./routes/OrdersRoutes"));
const CompensationRoutes_1 = __importDefault(require("./routes/CompensationRoutes"));
const BillingReportRoutes_1 = __importDefault(require("./routes/BillingReportRoutes"));
const express_session_1 = __importDefault(require("express-session"));
const uuid_1 = __importDefault(require("uuid"));
const AuthService_1 = __importDefault(require("./services/AuthService"));
const UserRoutes_1 = __importDefault(require("./routes/UserRoutes"));
const config_1 = __importDefault(require("config"));
require("reflect-metadata");
const typeorm_1 = require("typeorm");
//connect to db
typeorm_1.createConnection(Object.assign({
    entities: [
        __dirname + "/entities/*.js"
    ],
    synchronize: true
}, config_1.default.get('db'))).then(connection => {
    let app = express();
    const server = http_1.createServer(app);
    // CORS Headers
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", config_1.default.get('clientHost'));
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Allow-Credentials", "true");
        next();
    });
    // Bodyparser for json rest
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    // Session
    app.use(express_session_1.default({
        genid: (req) => {
            return uuid_1.default(); // use UUIDs for session IDs
        },
        secret: 'My super mega secret secret',
        resave: false,
        saveUninitialized: true
    }));
    // Authentication
    AuthService_1.default.init(app);
    AuthRoutes_1.default(app);
    UserRoutes_1.default(app);
    ContactsRoutes_1.default(app);
    OrdersRoutes_1.default(app);
    CompensationRoutes_1.default(app);
    BillingReportRoutes_1.default(app);
    BexioService_1.BexioService.addExpressHandlers(app);
    app.use(express.static(path_1.default.join(__dirname, '/../public/')));
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.join(__dirname + '/../public/index.html'));
    });
    server.listen(process.env.PORT || config_1.default.get('port'), () => {
        console.log('Listening on port: ' + (process.env.PORT || config_1.default.get('port')));
    });
});
//# sourceMappingURL=index.js.map