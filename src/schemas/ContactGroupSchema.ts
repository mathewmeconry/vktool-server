import { Schema } from "mongoose";

export const ContactGroupSchema: Schema = new Schema({
    bexioId: Number,
    name: String
})