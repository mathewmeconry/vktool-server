import * as Express from 'express'
import CliController from '../../controllers/CliController';
import supertest = require('supertest');
import { getConnectionOptions, createConnection } from 'typeorm';

before(async () => {
    return TestHelper.init()
})

export default class TestHelper {
    public static app: Express.Application
    public static authenticatedCookies: Array<string>

    public static async init() {
        let { app } = await CliController.startServer()
        TestHelper.app = app

        // @ts-ignore
        await createConnection()

        return supertest(TestHelper.app)
            .get('/api/auth/mock')
            .expect(200)
            .then(res => {
                TestHelper.authenticatedCookies = res.get('Set-Cookie')
            })
    }
}