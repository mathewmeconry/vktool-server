import CompensationEntryModel from "./CompensationEntryModel";
import { Schema } from "mongoose";

export default interface CompensationEntryOrderTypeModel extends CompensationEntryModel {
    billingReport: {
        id: Schema.Types.ObjectId,
        ref: 'BillingReport'
    },
    dayHours: number,
    nightHours: number,
    from: Date,
    to: Date,
    type: 'order'
}