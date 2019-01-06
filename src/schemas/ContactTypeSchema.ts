import { Schema } from "mongoose";

export const ContactTypeSchema: Schema = new Schema({
    bexioId: Number,
    name: String
})