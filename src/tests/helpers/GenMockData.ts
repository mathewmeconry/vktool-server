import Order from "../../entities/Order";
import Position from "../../entities/Position";
import Contact from "../../entities/Contact";
import ContactType from "../../entities/ContactType";
import ContactGroup from "../../entities/ContactGroup";
import { getManager } from "typeorm";
import User from "../../entities/User";
import { AuthRoles } from "../../interfaces/AuthRoles";

export async function genOrders(contact: Contact): Promise<Order> {
    let today = new Date()
    let order = new Order()

    order.contact = contact
    order.bexioId = 1
    order.deliveryAddress = 'any fancy address'
    order.documentNr = 'Nr 001'
    order.title = 'Mock Order'
    order.total = 999
    order.validFrom = today
    order = await order.save()

    let position = new Position()
    position.bexioId = 1
    position.orderBexioId = 1
    position.positionType = 'anyType'
    position.order = order
    position.text = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`
    await position.save()

    return order
}

export async function genMockContact(contactType: ContactType, contactGroups: Array<ContactGroup>): Promise<Contact> {
    let contact = new Contact()
    contact.address = 'this street 1'
    contact.bankName = 'any bank'
    contact.bexioId = 1
    contact.birthday = new Date()
    contact.city = 'any city'
    contact.contactGroups = contactGroups
    contact.contactType = contactType
    contact.firstname = 'Mock'
    contact.lastname = 'User'
    contact.nr = '1'
    contact.postcode = '1111'
    contact.mail = 'mock@mail.com'
    contact.ownerId = 1
    return contact.save()
}

export async function genMockContactType(): Promise<ContactType> {
    let type = new ContactType()
    type.name = 'Mock Type'
    type.bexioId = 1
    return type.save()
}

export async function genMockContactGroup(id?: number): Promise<ContactGroup> {
    let group: ContactGroup
    if (id) {
        group = (await getManager().getRepository(ContactGroup).findOne(id)) || new ContactGroup()
        group.name = 'MockGroup'
        group.bexioId = id
        group.id = id
        return group.save()
    } else {
        group = new ContactGroup()
        group.name = 'MockGroup'
        group.bexioId = 1
        return group.save()
    }
}

export async function genMockUser(): Promise<User> {
    let user = new User()
    user.displayName = 'Mock User'
    user.provider = 'office365'
    user.roles = [AuthRoles.ADMIN]
    return user.save()
}