import { Schema } from "mongoose";
import BillingReportModel from '../models/BillingReportModel'

export const BillingReportSchema: Schema = new Schema({
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'Contact'
    },
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order'
    },
    orderDate: Date,
    lastModifiedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Contact'
    },
    compensations: [{
        type: Schema.Types.ObjectId,
        ref: 'CompensationEntry'
    }],
    approvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Contact',
        required: false
    },
    food: Boolean,
    remarks: String,
    status: String,
    updatedAt: Date
})

BillingReportSchema.pre('save', function (next: Function): void {
    (<BillingReportModel>this).updatedAt = new Date()
    next()
})