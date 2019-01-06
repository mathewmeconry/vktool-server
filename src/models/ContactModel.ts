import { Document,Schema } from 'mongoose';
import ContactGroupModel from './ContactGroupModel';

export default interface ContactModel extends Document {
    _id: any,
    bexioId: number,
    nr: string,
    contactType: {
        id: Schema.Types.ObjectId,
        ref: 'ContactType'
    },
    firstname: string,
    lastname: string,
    birthday: Date,
    address: string,
    postcode: string,
    city: string,
    mail: string,
    mailSecond?: string,
    phoneFixed?: string,
    phoneFixedSecond?: string,
    phoneMobile?: string,
    remarks?: string,
    contactGroups: Array<{
        id: Schema.Types.ObjectId,
        ref: 'ContactGroup'
    }> | Array<ContactGroupModel>,
    contactId: number,
    ownerId: number,
    updatedAt: Date,
    [index: string]: any,
    getFullName(): string
}