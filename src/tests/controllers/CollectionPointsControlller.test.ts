import TestHelper from '../helpers/TestHelper';
import * as Express from 'express';
import CollectionPoint from '../../entities/CollectionPoint';
import supertest = require('supertest');
import { expect } from 'chai';

describe('CollectionPointsController', function () {
	this.timeout(5000);
	let app: Express.Application;
	let dbRecord: CollectionPoint;
	let collectionPoint = {
		address: 'Neuenhoferstrasse 101',
		city: 'Baden',
		name: 'Best Place ever',
		postcode: '5400',
	};

	before(() => {
		app = TestHelper.app;
	});

	it('should add a new collection point', async () => {
		return supertest(app)
			.put('/api/collection-points')
			.set('Cookie', TestHelper.authenticatedNonAdminCookies)
			.expect(200)
			.send(collectionPoint)
			.then((res) => {
				dbRecord = res.body;
				expect(dbRecord.address).to.be.equal(collectionPoint.address);
				expect(dbRecord.city).to.be.equal(collectionPoint.city);
				expect(dbRecord.name).to.be.equal(collectionPoint.name);
				expect(dbRecord.postcode).to.be.equal(collectionPoint.postcode);
			});
	});

	it('should return all collection points', async () => {
		return supertest(app)
			.get('/api/collection-points')
			.set('Cookie', TestHelper.authenticatedNonAdminCookies)
			.expect(200)
			.then((res) => {
				let rec = res.body[res.body.length - 1];
				expect(rec.id).to.be.equal(dbRecord.id);
				expect(rec.address).to.be.equal(dbRecord.address);
				expect(rec.city).to.be.equal(dbRecord.city);
				expect(rec.name).to.be.equal(dbRecord.name);
				expect(rec.postcode).to.be.equal(dbRecord.postcode);
			});
	});
});
