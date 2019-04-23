import { expect } from "chai";
import * as Express from 'express'
import supertest = require("supertest");
import TestHelper from "../helpers/TestHelper";
import Contact from "../../entities/Contact";
import ContactGroup from "../../entities/ContactGroup";
import CollectionPoint from "../../entities/CollectionPoint";

describe('ContactsController', function () {
    this.timeout(5000)
    let app: Express.Application;
    let editContact = {
        id: 1,
        collectionPointId: 1,
        entryDate: '1970-01-01T00:00:00.000Z',
        exitDate: '1970-01-01T00:00:00.000Z',
        bankName: 'my super bank',
        iban: 'GB33BUKB20201555555555',
        accountHolder: 'myself'
    }

    before(() => {
        app = TestHelper.app
    })

    it('get contacts', async () => {
        return supertest(app)
            .get('/api/contacts')
            .set('Cookie', TestHelper.authenticatedCookies)
            .expect(200)
            .then(res => {
                expect(res.body.length).to.be.greaterThan(0)
            })
    })

    it('get members', async () => {
        return supertest(app)
            .get('/api/members')
            .set('Cookie', TestHelper.authenticatedCookies)
            .expect(200)
            .then(res => {
                expect(res.body.length).to.be.greaterThan(0)
                for (let member of (res.body as Array<Contact>)) {
                    expect(member).to.have.ownProperty('firstname')
                    expect(member).to.have.ownProperty('lastname')
                    expect(member).to.have.ownProperty('address')
                    expect(member).to.have.ownProperty('postcode')
                    expect(member).to.have.ownProperty('city')
                    expect(member).to.have.ownProperty('mail')
                    expect(member).to.have.ownProperty('rank')
                    expect(member).to.have.ownProperty('functions')
                    expect(member).to.have.ownProperty('collectionPoint')
                    expect(member).to.have.ownProperty('entryDate')
                    expect(member).to.have.ownProperty('exitDate')
                    expect(member).to.have.ownProperty('bankName')
                    expect(member).to.have.ownProperty('iban')
                    expect(member).to.have.ownProperty('accountHolder')

                    let groupIds = member.contactGroups.map(el => {
                        return el.bexioId
                    })
                    expect(groupIds).include(7)
                }
            })
    })

    it('get ranks', async () => {
        return supertest(app)
            .get('/api/ranks')
            .set('Cookie', TestHelper.authenticatedCookies)
            .expect(200)
            .then(res => {
                expect(res.body.length).to.be.greaterThan(0)

                let ids = (res.body as Array<ContactGroup>).map(el => el.bexioId)
                expect(ids).to.be.members([17, 13, 11, 12, 28, 29, 15, 27, 26, 10, 14])
            })
    })

    it('post contact', async () => {
        return supertest(app)
            .post('/api/contacts')
            .set('Cookie', TestHelper.authenticatedCookies)
            .expect(200)
            .send(editContact)
            .then(res => {
                let contact = res.body as Contact
                expect(contact.collectionPoint).not.to.be.undefined
                expect(contact.entryDate).not.to.be.null
                expect(contact.exitDate).not.to.be.null
                expect(contact.bankName).not.to.be.null
                expect(contact.iban).not.to.be.null
                expect(contact.accountHolder).not.to.be.null

                expect((contact.collectionPoint as CollectionPoint).id).to.be.equal(editContact.collectionPointId)
                expect(contact.entryDate).to.be.equal(editContact.entryDate)
                expect(contact.exitDate).to.be.equal(editContact.exitDate)
                expect(contact.bankName).to.be.equal(editContact.bankName)
                expect(contact.iban).to.be.equal(editContact.iban)
                expect(contact.accountHolder).to.be.equal(editContact.accountHolder)
            })
    })
})
