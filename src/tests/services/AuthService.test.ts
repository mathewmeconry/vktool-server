import AuthService from '../../services/AuthService';
import { AuthRoles } from '../../interfaces/AuthRoles';
import { expect } from 'chai';
import * as Express from 'express';
import supertest = require('supertest');
import TestHelper from '../helpers/TestHelper';

describe('AuthService', () => {
	let app: Express.Application;

	before(() => {
		app = TestHelper.app;
	});

	it('should allow everything to admin', () => {
		expect(AuthService.isAuthorized([AuthRoles.ADMIN], AuthRoles.BILLINGREPORTS_CREATE)).to.be.true;
	});

	it('should block if no access', () => {
		expect(AuthService.isAuthorized([AuthRoles.MEMBERS_READ], AuthRoles.MEMBERS_EDIT)).to.be.false;
	});

	it('should allow', () => {
		expect(AuthService.isAuthorized([AuthRoles.MEMBERS_EDIT], AuthRoles.MEMBERS_EDIT)).to.be.true;
	});

	describe('AuthService middleware', () => {
		it('should return 403', async () => {
			return supertest(app)
				.get('/api/check/authservice?bypass=false')
				.set('Cookie', TestHelper.authenticatedNonAdminCookies)
				.expect(403)
				.then((res) => {
					expect(res.body.error).to.be.equal('Forbidden');
				});
		});

		it('should return 401', async () => {
			return supertest(app)
				.get('/api/check/authservice')
				.expect(401)
				.then((res) => {
					expect(res.body.error).to.be.equal('Not authorized');
				});
		});

		it('should call next', () => {
			return supertest(app)
				.get('/api/check/authservice')
				.set('Cookie', TestHelper.authenticatedAdminCookies)
				.expect(200);
		});
	});
});
