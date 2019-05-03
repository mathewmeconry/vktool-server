import * as Express from 'express'
import CliController from '../../controllers/CliController';
import supertest = require('supertest');
import { getConnectionOptions, createConnection } from 'typeorm';
import { genOrders, genMockContactGroup, genMockContactType, genMockContact, genMockUser } from './GenMockData';
import ContactGroup from '../../entities/ContactGroup';
import ContactType from '../../entities/ContactType';
import Contact from '../../entities/Contact';
import Order from '../../entities/Order';
import User from '../../entities/User';

before(async () => {
    return TestHelper.init()
})

export default class TestHelper {
    public static app: Express.Application
    public static authenticatedCookies: Array<string>

    public static mockUser: User
    public static mockGroup: ContactGroup
    public static mockMemberGroup: ContactGroup
    public static mockType: ContactType
    public static mockContact: Contact
    public static mockContact2: Contact
    public static mockOrder: Order

    public static async init() {
        let { app } = await CliController.startServer()
        TestHelper.app = app

        // @ts-ignore
        await createConnection()

        TestHelper.mockUser = await genMockUser()
        TestHelper.mockGroup = await genMockContactGroup()
        TestHelper.mockMemberGroup = await genMockContactGroup(7)
        TestHelper.mockType = await genMockContactType()
        TestHelper.mockContact = await genMockContact(TestHelper.mockType, [TestHelper.mockGroup, TestHelper.mockMemberGroup])
        TestHelper.mockContact2 = await genMockContact(TestHelper.mockType, [TestHelper.mockGroup, TestHelper.mockMemberGroup])
        TestHelper.mockOrder = await genOrders(TestHelper.mockContact)

        return supertest(TestHelper.app)
            .get('/api/auth/mock')
            .expect(200)
            .then(res => {
                TestHelper.authenticatedCookies = res.get('Set-Cookie')
            })
    }
}