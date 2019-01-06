import mongoose from "mongoose";
import { ContactSchema } from "../schemas/ContactSchema";
import ContactModel from "../models/ContactModel";

export default mongoose.model<ContactModel>('Contact', ContactSchema)