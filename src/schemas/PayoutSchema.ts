import { Schema } from "mongoose";
import PayoutModel from '../models/PayoutModel'

export const PayoutSchema: Schema = new Schema({
    date: Date,
    entries: [{
        type: Schema.Types.ObjectId,
        ref: 'CompensationEntry'
    }],
    valutaDate: Date,
    updatedAt: Date
})


PayoutSchema.pre('save', function (next: Function): void {
    (<PayoutModel>this).updatedAt = new Date()
    next()
})