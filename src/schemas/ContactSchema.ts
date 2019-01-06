import ContactModel from "../models/ContactModel";
import { Schema } from "mongoose";

export const ContactSchema: Schema = new Schema({
    bexioId: Number,
    nr: String,
    contactType: {
        type: Schema.Types.ObjectId,
        ref: 'ContactType'
    },
    firstname: String,
    lastname: String,
    birthday: Date,
    address: String,
    postcode: String,
    city: String,
    mail: String,
    mailSecond: String,
    phoneFixed: String,
    phoneFixedSecond: String,
    phoneMobile: String,
    remarks: String,
    contactGroups: [{
        type: Schema.Types.ObjectId,
        ref: 'ContactGroup'
    }],
    contactId: Number,
    ownerId: Number,
    updatedAt: Date
})

ContactSchema.methods.getFullName = function (): string {
    return (this.firstName.trim() + " " + this.lastName.trim())
}

ContactSchema.pre('save', function (next: Function): void{
    (<ContactModel>this).updatedAt = new Date()
    next()
})