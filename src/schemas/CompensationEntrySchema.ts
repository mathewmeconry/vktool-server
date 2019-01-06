import { Schema } from "mongoose";
import CompensationEntryModel from "../models/CompensationEntryModel";

export const CompensationEntrySchema: Schema = new Schema({
    member: {
        type: Schema.Types.ObjectId,
        ref: 'Contact'
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'Contact'
    },
    amount: Number,
    dayHours: Number,
    nightHours: Number,
    date: Date,
    from: Date,
    to: Date,
    billingReport: {
        type: Schema.Types.ObjectId,
        ref: 'BillingReport'
    },
    type: String,
    paied: { type: Boolean, default: false },
    payout: {
        type: Schema.Types.ObjectId,
        ref: 'Payout'
    },
    approved: Boolean,
    updatedAt: Date
})

CompensationEntrySchema.pre('save', function (next: Function): void {
    (<CompensationEntryModel>this).updatedAt = new Date()
    next()
})