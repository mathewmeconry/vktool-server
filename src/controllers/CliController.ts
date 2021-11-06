const express = require('express');
import path from 'path';
import * as Express from 'express';
import { BexioService } from '../services/BexioService';
import * as bodyParser from 'body-parser';
import session from 'express-session';
import { v4 as uuidv4 } from 'uuid';
import AuthService from '../services/AuthService';
import config from 'config';
import 'reflect-metadata';
import FileStore from 'session-file-store';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server-express';
import { graphqlUploadExpress } from 'graphql-upload';

// Routes
import AuthRoutes from '../routes/AuthRoutes';
import ContactsRoutes from '../routes/ContactsRoutes';
import PayoutRoutes from '../routes/PayoutRoutes';
import { Server } from 'http';
import User from '../entities/User';
import LogoffRoutes from '../routes/LogoffRoutes';
import MaterialChangelogRoutes from '../routes/MaterialChangelogRoutes';
import WarehouseRoutes from '../routes/WarehouseRoutes';

export interface ApolloContext {
	user: User;
}

export default class CliController {
	public static async startServer(): Promise<{ app: Express.Application; server: Server }> {
		let app: Express.Application = express();

		// CORS Headers
		app.use(function (req, res, next) {
			res.header('Access-Control-Allow-Origin', config.get('clientHost'));
			res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
			res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
			res.header('Access-Control-Allow-Credentials', 'true');
			next();
		});

		// Bodyparser for json rest
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({ extended: true }));

		// Session
		app.use(
			session({
				genid: (req) => {
					return uuidv4(); // use UUIDs for session IDs
				},
				store: new (FileStore(session))(),
				secret: 'My super mega secret secret',
				resave: false,
				saveUninitialized: true,
				cookie: {
					maxAge: Date.now() + 30 * 86400 * 1000,
				},
			})
		);

		// Authentication
		AuthService.init(app);

		const apiRouter = Express.Router();

		AuthRoutes(apiRouter);
		ContactsRoutes(apiRouter);
		PayoutRoutes(apiRouter);
		LogoffRoutes(apiRouter);
		MaterialChangelogRoutes(apiRouter);
		WarehouseRoutes(apiRouter);

		app.use('/api', apiRouter);

		BexioService.addExpressHandlers(app);

		// setup graphql upload functionality
		// app.use(graphqlUploadExpress());

		// setup apollo
		const schema = await buildSchema({
			resolvers: [path.join(__dirname, '../resolvers/*.resolver.js')],
			emitSchemaFile: true,
			validate: true,
			authChecker: AuthService.isAuthorizedGraphQl,
		});

		const apollo = new ApolloServer({
			schema,
			playground: process.env.NODE_ENV !== 'production',
			tracing: process.env.NODE_ENV !== 'production',
			uploads: true,
			context: ({ req }): ApolloContext => {
				return {
					user: req.user,
				};
			},
		});
		apollo.applyMiddleware({
			app,
			cors: {
				allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
				credentials: true,
				origin: config.get('clientHost'),
				exposedHeaders: 'GET, POST, PUT, DELETE',
			},
		});

		app.use('/webapp/', express.static(path.join(__dirname, '/../../public/')));
		app.use('/static/', express.static(config.get('fileStorage')));
		app.get('/webapp/*', (req, res) => {
			res.sendFile(path.join(__dirname + '/../../public/index.html'));
		});
		app.get('*', (req, res) => {
			res.redirect('/webapp/');
		});

		const server = app.listen(process.env.PORT || config.get('port'), () => {
			console.log('Listening on port: ' + (process.env.PORT || config.get('port')));
		});

		return { app, server };
	}
}
