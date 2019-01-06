import { Document, Schema } from "mongoose";

export default interface CompensationEntryModel extends Document {
    member: {
        id: Schema.Types.ObjectId,
        ref: 'Contact'
    },
    amount: number,
    date: Date,
    creator: {
        id: Schema.Types.ObjectId,
        ref: 'User'
    },
    lastModifiedBy: {
        id: Schema.Types.ObjectId,
        ref: 'User'
    },
    paied: boolean,
    payout: {
        id: Schema.Types.ObjectId,
        ref: 'Payout'
    },
    updatedAt: Date,
    type: 'order' | 'custom',
    approved: boolean
}