import * as Express from 'express';
import TestHelper from '../helpers/TestHelper';
import supertest = require('supertest');
import { expect } from 'chai';
import User from '../../entities/User';
import { AuthRoles } from '../../interfaces/AuthRoles';

describe('UsersController', function () {
	this.timeout(5000);
	let app: Express.Application;

	before(() => {
		app = TestHelper.app;
	});

	it('should return the current user', async () => {
		return supertest(app)
			.get('/api/me')
			.set('Cookie', TestHelper.authenticatedAdminCookies)
			.expect(200)
			.then((res) => {
				let record: User = res.body;
				expect(record).to.has.ownProperty('displayName');
				expect(record).to.has.ownProperty('roles');
				expect(record).to.has.ownProperty('provider');
				expect(record).to.has.ownProperty('lastLogin');
				expect(record.roles.length).to.be.greaterThan(0);
				expect(record.roles).include(AuthRoles.ADMIN);
				expect(record.provider).to.be.equal('mock');
			});
	});

	it('should return all users', async () => {
		return supertest(app)
			.get('/api/users')
			.set('Cookie', TestHelper.authenticatedAdminCookies)
			.expect(200)
			.then((res) => {
				const records: User[] = res.body as User[];
				expect(records.length).to.be.greaterThan(0);
			});
	});
});
