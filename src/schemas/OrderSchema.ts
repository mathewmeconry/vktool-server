import OrderModel from "../models/OrderModel";
import { Schema } from "mongoose";

export const OrderSchema: Schema = new Schema({
    bexioId: Number,
    documentNr: String,
    title: String,
    total: Number,
    execDates: [{
        type: Date
    }],
    contact: {
        type: Schema.Types.ObjectId,
        ref: 'Contact'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Contact'
    },
    positions: [{
        type: Schema.Types.ObjectId,
        ref: 'Position'
    }],
    updatedAt: Date
})


OrderSchema.pre('save', function (next: Function): void{
    (<OrderModel>this).updatedAt = new Date()
    next()
})