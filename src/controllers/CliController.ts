const express = require('express')
import path from 'path'
import * as Express from 'express'
import { createServer } from 'http'
import { BexioService } from '../services/BexioService'
import * as bodyParser from 'body-parser'
import AuthRoutes from '../routes/AuthRoutes';
import ContactsRoutes from '../routes/ContactsRoutes';
import OrdersRoutes from '../routes/OrdersRoutes';
import CompensationRoutes from '../routes/CompensationRoutes';
import BillingReportRoutes from '../routes/BillingReportRoutes';
import session from 'express-session'
import uuid from 'uuid'
import AuthService from '../services/AuthService';
import UserRoutes from '../routes/UserRoutes';
import config from 'config'
import "reflect-metadata";
import FileStore from 'session-file-store'
import CollectionPointsRoutes from '../routes/CollectionPointsRoutes';

export default class CliController {
    public static async startServer(): Promise<{ app: Express.Application, server: Server }> {
        let app: Express.Application = express()
        const server = createServer(app)

        // CORS Headers
        app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", config.get('clientHost'))
            res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
            res.header("Access-Control-Allow-Credentials", "true")
            next();
        });

        // Bodyparser for json rest
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        // Session
        app.use(session({
            genid: (req) => {
                return uuid() // use UUIDs for session IDs
            },
            store: new (FileStore(session))(),
            secret: 'My super mega secret secret',
            resave: false,
            saveUninitialized: true
        }))

        // Authentication
        AuthService.init(app)

        AuthRoutes(app)
        UserRoutes(app)
        ContactsRoutes(app)
        OrdersRoutes(app)
        CompensationRoutes(app)
        BillingReportRoutes(app)
        CollectionPointsRoutes(app)
        BexioService.addExpressHandlers(app)

        app.use(express.static(path.join(__dirname, '/../../public/')));
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname + '/../../public/index.html'))
        })

        server.listen(process.env.PORT || config.get('port'), () => {
            console.log('Listening on port: ' + (process.env.PORT || config.get('port')))
        })

        return { app, server }
    }
}