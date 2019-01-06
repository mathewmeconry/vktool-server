import { ContactTypeSchema } from "./../schemas/ContactTypeSchema";
import mongoose from "mongoose";
import ContactTypeModel from "../models/ContactTypeModel";

export default mongoose.model<ContactTypeModel>('ContactType', ContactTypeSchema)