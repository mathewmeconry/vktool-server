import { Document, Schema } from "mongoose";
import PositionModel from "./PositionModel";
import ContactModel from "./ContactModel";

export default interface OrderModel extends Document {
    bexioId: number,
    documentNr: string,
    title: string,
    total: number,
    execDates: Array<Date>,
    contact: {
        id: Schema.Types.ObjectId,
        ref: 'Contact'
    } | ContactModel,
    user: {
        id: Schema.Types.ObjectId,
        ref: 'Contact'
    } | ContactModel,
    positions: Array<{
        id: Schema.Types.ObjectId,
        ref: 'Position'
    }> | Array<PositionModel>,
    updatedAt: Date
}