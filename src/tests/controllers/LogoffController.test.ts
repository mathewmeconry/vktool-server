import { expect } from 'chai';
import * as Express from 'express';
import supertest = require('supertest');
import TestHelper from '../helpers/TestHelper';
import Logoff, { LogoffState } from '../../entities/Logoff';

describe('Logoff Controller', () => {
	let app: Express.Application;
	let logoff: Logoff;
	let logoff2: Logoff;

	let logoffAddPayload: { contact: number; from: string; until: string; state?: LogoffState };
	let logoffAddDeclinedPayload: {
		contact: number;
		from: string;
		until: string;
		state?: LogoffState;
	};

	let logoffBulkPayload: {
		contact: number;
		logoffs: Array<{ from: string; until: string; state?: LogoffState; remarks?: string }>;
	};

	before(() => {
		app = TestHelper.app;

		logoffAddPayload = {
			contact: TestHelper.mockContact.id,
			from: '2020-01-01T09:30:00.000Z',
			until: '2020-01-08T09:30:00.000Z',
		};

		logoffAddDeclinedPayload = {
			contact: TestHelper.mockContact.id,
			from: '2020-01-01T09:30:00.000Z',
			until: '2020-01-08T09:30:00.000Z',
			state: LogoffState.DECLINED,
		};

		logoffBulkPayload = {
			contact: TestHelper.mockContact2.id,
			logoffs: [
				{
					from: '2020-01-01T09:30:00.000Z',
					until: '2020-01-08T09:30:00.000Z',
				},
				{
					from: '2020-01-10T09:30:00.000Z',
					until: '2020-01-12T09:30:00.000Z',
					remarks: 'There is one',
					state: LogoffState.DECLINED,
				},
			],
		};
	});

	describe('add', () => {
		it('should add an approved logoff', async () => {
			return supertest(app)
				.put('/api/logoffs/add')
				.set('Cookie', TestHelper.authenticatedAdminCookies)
				.send(logoffAddPayload)
				.expect(200)
				.then((res) => {
					expect(res.body.contact.id).to.be.eq(logoffAddPayload.contact);
					expect(res.body.from).to.be.eq(logoffAddPayload.from);
					expect(res.body.until).to.be.eq(logoffAddPayload.until);
					expect(res.body.remarks).to.be.null;
					expect(res.body.state).to.be.eq(LogoffState.APPROVED);
					logoff = res.body;
				});
		});

		it('should add an pending logoff', async () => {
			return supertest(app)
				.put('/api/logoffs/add?bypass=true')
				.set('Cookie', TestHelper.authenticatedNonAdminCookies)
				.send(logoffAddDeclinedPayload)
				.expect(200)
				.then((res) => {
					expect(res.body.contact.id).to.be.eq(logoffAddDeclinedPayload.contact);
					expect(res.body.from).to.be.eq(logoffAddDeclinedPayload.from);
					expect(res.body.until).to.be.eq(logoffAddDeclinedPayload.until);
					expect(res.body.remarks).to.be.null;
					expect(res.body.state).to.be.eq(LogoffState.PENDING);
					logoff2 = res.body;
				});
		});

		it('should add an declined logoff', async () => {
			return supertest(app)
				.put('/api/logoffs/add')
				.set('Cookie', TestHelper.authenticatedAdminCookies)
				.send(logoffAddDeclinedPayload)
				.expect(200)
				.then((res) => {
					expect(res.body.contact.id).to.be.eq(logoffAddDeclinedPayload.contact);
					expect(res.body.from).to.be.eq(logoffAddDeclinedPayload.from);
					expect(res.body.until).to.be.eq(logoffAddDeclinedPayload.until);
					expect(res.body.remarks).to.be.null;
					expect(res.body.state).to.be.eq(LogoffState.DECLINED);
				});
		});

		it('should return 500 with no contact', async () => {
			return supertest(app)
				.put('/api/logoffs/add')
				.set('Cookie', TestHelper.authenticatedAdminCookies)
				.send({ ...logoffAddPayload, contact: undefined })
				.expect(500);
		});

		it('should return 500 with no from', async () => {
			return supertest(app)
				.put('/api/logoffs/add')
				.set('Cookie', TestHelper.authenticatedAdminCookies)
				.send({ ...logoffAddPayload, from: undefined })
				.expect(500);
		});

		it('should return 500 with no until', async () => {
			return supertest(app)
				.put('/api/logoffs/add')
				.set('Cookie', TestHelper.authenticatedAdminCookies)
				.send({ ...logoffAddPayload, until: undefined })
				.expect(500);
		});

		it('should return 500 with no valid state', async () => {
			return supertest(app)
				.put('/api/logoffs/add')
				.set('Cookie', TestHelper.authenticatedAdminCookies)
				.send({ ...logoffAddPayload, state: 'invalid' })
				.expect(500);
		});
	});

	describe('add bulk', () => {
		it('should add some logoffs', async () => {
			return supertest(app)
				.put('/api/logoffs/add/bulk')
				.set('Cookie', TestHelper.authenticatedAdminCookies)
				.send(logoffBulkPayload)
				.expect(200)
				.then((res) => {
					expect(res.body.length).to.be.eq(logoffBulkPayload.logoffs.length);
					expect(res.body[0].contact.id).to.be.eq(logoffBulkPayload.contact);
					expect(res.body[0].remarks).to.be.null;
					expect(res.body[0].state).to.be.eq(LogoffState.APPROVED);
					expect(res.body[1].remarks).to.be.eq('There is one');
					expect(res.body[1].state).to.be.eq(LogoffState.DECLINED);
				});
		});

		it('should add some pending logoffs', async () => {
			return supertest(app)
				.put('/api/logoffs/add/bulk?bypass=true')
				.set('Cookie', TestHelper.authenticatedNonAdminCookies)
				.send(logoffBulkPayload)
				.expect(200)
				.then((res) => {
					expect(res.body.length).to.be.eq(logoffBulkPayload.logoffs.length);
					expect(res.body[0].contact.id).to.be.eq(logoffBulkPayload.contact);
					expect(res.body[0].remarks).to.be.null;
					expect(res.body[0].state).to.be.eq(LogoffState.PENDING);
					expect(res.body[1].remarks).to.be.eq('There is one');
					expect(res.body[1].state).to.be.eq(LogoffState.PENDING);
				});
		});

		it('should return 500 with no contact', async () => {
			return supertest(app)
				.put('/api/logoffs/add')
				.set('Cookie', TestHelper.authenticatedAdminCookies)
				.send({ ...logoffBulkPayload, contact: undefined })
				.expect(500);
		});

		it('should return 500 with no from', async () => {
			return supertest(app)
				.put('/api/logoffs/add')
				.set('Cookie', TestHelper.authenticatedAdminCookies)
				.send({ ...logoffBulkPayload, logoffs: [{ until: logoffBulkPayload.logoffs[0].until }] })
				.expect(500);
		});

		it('should return 500 with no until', async () => {
			return supertest(app)
				.put('/api/logoffs/add')
				.set('Cookie', TestHelper.authenticatedAdminCookies)
				.send({ ...logoffBulkPayload, logoffs: [{ from: logoffBulkPayload.logoffs[0].from }] })
				.expect(500);
		});

		it('should return 500 with no valid state', async () => {
			return supertest(app)
				.put('/api/logoffs/add')
				.set('Cookie', TestHelper.authenticatedAdminCookies)
				.send({
					...logoffBulkPayload,
					logoffs: [
						{
							from: logoffBulkPayload.logoffs[0].from,
							until: logoffBulkPayload.logoffs[0].until,
							state: 'invalid',
						},
					],
				})
				.expect(500);
		});
	});

	describe('getAll', () => {
		it('should return all logoffs', async () => {
			return supertest(app)
				.get('/api/logoffs')
				.set('Cookie', TestHelper.authenticatedAdminCookies)
				.send(logoffBulkPayload)
				.expect(200)
				.then((res) => {
					expect(res.body.length).to.be.greaterThan(logoffBulkPayload.logoffs.length);
				});
		});
	});

	describe('state changes', () => {
		it('should decline', async () => {
			return supertest(app)
				.post('/api/logoffs/decline')
				.set('Cookie', TestHelper.authenticatedAdminCookies)
				.send({ id: logoff.id })
				.expect(200)
				.then((res) => {
					expect(res.body.id).to.be.eq(logoff.id);
					expect(res.body.state).to.be.eq(LogoffState.DECLINED);
				});
		});

		it('decline should send 500', async () => {
			return supertest(app)
				.post('/api/logoffs/decline')
				.set('Cookie', TestHelper.authenticatedAdminCookies)
				.send()
				.expect(500);
		});

		it('should approve', async () => {
			return supertest(app)
				.post('/api/logoffs/approve')
				.set('Cookie', TestHelper.authenticatedAdminCookies)
				.send({ id: logoff.id })
				.expect(200)
				.then((res) => {
					expect(res.body.id).to.be.eq(logoff.id);
					expect(res.body.state).to.be.eq(LogoffState.APPROVED);
				});
		});

		it('approve should send 500', async () => {
			return supertest(app)
				.post('/api/logoffs/approve')
				.set('Cookie', TestHelper.authenticatedAdminCookies)
				.send()
				.expect(500);
		});
	});

	describe('delete', () => {
		it('should softdelete in URL', async () => {
			return supertest(app)
				.delete(`/api/logoffs/${logoff.id}`)
				.set('Cookie', TestHelper.authenticatedAdminCookies)
				.expect(200)
				.then((res) => {
					expect(res.body.deletedAt).not.to.be.eq(undefined);
					expect(res.body.deletedBy.id).to.be.eq(TestHelper.mockAdminUser.id);
				});
		});

		it('should softdelete in query params', async () => {
			return supertest(app)
				.delete(`/api/logoffs?logoff=${logoff2.id}`)
				.set('Cookie', TestHelper.authenticatedAdminCookies)
				.expect(200)
				.then((res) => {
					expect(res.body.deletedAt).not.to.be.eq(undefined);
					expect(res.body.deletedBy.id).to.be.eq(TestHelper.mockAdminUser.id);
				});
		});

		it('should fail with 500', async () => {
			return supertest(app)
				.delete(`/api/logoffs`)
				.set('Cookie', TestHelper.authenticatedAdminCookies)
				.expect(500);
		});
	});
});
