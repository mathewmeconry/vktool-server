import { Schema } from "mongoose";
import PositionModel from "../models/PositionModel";

export const PositionSchema: Schema = new Schema({
    bexioId: Number,
    orderBexioId: Number,
    positionType: String,
    text: String,
    pos: String,
    internalPos: String,
    articleId: Number,
    positionTotal: Number,
    updatedAt: Date
})


PositionSchema.pre('save', function (next: Function): void {
    (<PositionModel>this).updatedAt = new Date()
    next()
})