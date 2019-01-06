import mongoose from "mongoose";
import { ContactGroupSchema } from "../schemas/ContactGroupSchema";
import ContactGroupModel from "../models/ContactGroupModel";

export default mongoose.model<ContactGroupModel>('ContactGroup', ContactGroupSchema)