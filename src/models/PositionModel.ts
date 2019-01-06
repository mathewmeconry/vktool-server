import { Document } from "mongoose";

export default interface PositionModel extends Document {
    bexioId: number,
    orderBexioId: number,
    positionType: number,
    text: string,
    pos: string,
    internalPos: string,
    articleId: number,
    positionTotal: number,
    updatedAt: Date
}