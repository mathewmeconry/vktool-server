const express = require('express')
import path from 'path'
import * as Express from 'express'
import { BexioService } from '../services/BexioService'
import * as bodyParser from 'body-parser'
import session from 'express-session'
import uuid from 'uuid'
import AuthService from '../services/AuthService';
import config from 'config'
import "reflect-metadata";
import FileStore from 'session-file-store'

// Routes
import UserRoutes from '../routes/UserRoutes';
import AuthRoutes from '../routes/AuthRoutes';
import ContactsRoutes from '../routes/ContactsRoutes';
import OrdersRoutes from '../routes/OrdersRoutes';
import CompensationRoutes from '../routes/CompensationRoutes';
import BillingReportRoutes from '../routes/BillingReportRoutes';
import CollectionPointsRoutes from '../routes/CollectionPointsRoutes';
import PayoutRoutes from '../routes/PayoutRoutes';
import LogoffRoutes from '../routes/LogoffRoutes'

export default class CliController {
    public static async startServer(): Promise<Express.Application> {
        let app: Express.Application = express()

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
            saveUninitialized: true,
            cookie: {
                maxAge: (Date.now() + 30 * 86400 * 1000)
            }
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
        PayoutRoutes(app)
        LogoffRoutes(app)
        BexioService.addExpressHandlers(app)

        app.use('/webapp/', express.static(path.join(__dirname, '/../../public/')));
        app.get('/webapp/*', (req, res) => {
            res.sendFile(path.join(__dirname + '/../../public/index.html'))
        })
        app.get('*', (req, res) => {
            res.redirect('/webapp/')
        })

        app.listen(process.env.PORT || config.get('port'), () => {
            console.log('Listening on port: ' + (process.env.PORT || config.get('port')))
        })

        return app
    }
}