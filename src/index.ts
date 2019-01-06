const express = require('express')
import path from 'path'
import * as Express from 'express'
import { createServer } from 'http'
import mongoose from "mongoose";
import { BexioService } from './services/BexioService'
import * as bodyParser from 'body-parser'
import AuthRoutes from './routes/AuthRoutes';
import ContactsRoutes from './routes/ContactsRoutes';
import OrdersRoutes from './routes/OrdersRoutes';
import CompensationRoutes from './routes/CompensationRoutes';
import BillingReportRoutes from './routes/BillingReportRoutes';
import session from 'express-session'
import uuid from 'uuid'
import AuthService from './services/AuthService';
import UserRoutes from './routes/UserRoutes';


//connect to mongoose
mongoose.connect('mongodb://mongo-vkazu-tool:xCDadoQcctQ4KhGCmWO0biXixZJcA3Q2YkfWrCc8fjqi5AxvarwzMkOaSEpm13e5EWJjWdLQqmPLhs6t65sCvQ%3D%3D@mongo-vkazu-tool.documents.azure.com:10250/tool?ssl=true&sslverifycertificate=false').then((con: mongoose.Mongoose) => {
    let app: Express.Application = express()
    const server = createServer(app)

    // CORS Headers
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "https://vkazutool.azurewebsites.net")
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT")
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
    BexioService.addExpressHandlers(app)

    app.use(express.static(path.join(__dirname, '/../public/')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname + '/../public/index.html'))
    })

    server.listen(process.env.PORT || 8080, () => {
        console.log('Listening on port: ' + (process.env.PORT || 8080))
    })
});