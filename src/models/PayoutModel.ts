import { Schema } from "mongoose";
import { Document} from 'mongoose'

export default interface PayoutModel extends Document {
    date: Date,
    entries: [{
        id: Schema.Types.ObjectId,
        ref: 'CompensationEntry'
    }],
    valutaDate: Date,
    updatedAt: Date
}