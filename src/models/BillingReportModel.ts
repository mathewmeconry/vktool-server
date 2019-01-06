import { Document, Schema } from 'mongoose';
import CompensationEntryModel from './CompensationEntryModel';
import OrderModel from './OrderModel';
import UserModel from './UserModel';

export default interface BillingReportModel extends Document {
    creator: {
        id: Schema.Types.ObjectId,
        ref: 'User'
    } | UserModel,
    order: {
        id: Schema.Types.ObjectId,
        ref: 'Order'
    } | OrderModel,
    orderDate: Date,
    lastModifiedBy: {
        id: Schema.Types.ObjectId,
        ref: 'User'
    },
    compensations: [{
        id: Schema.Types.ObjectId,
        ref: 'CompensationEntry'
    }] | Array<CompensationEntryModel>,
    approvedBy: {
        id: Schema.Types.ObjectId,
        ref: 'User'
    },
    food: boolean
    remarks: string,
    status: 'pending' | 'approved' | 'declined',
    updatedAt: Date
}