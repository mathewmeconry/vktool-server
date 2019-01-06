import mongoose from "mongoose";
import PositionModel from "../models/PositionModel";
import { PositionSchema } from "../schemas/PositionSchema";

export default mongoose.model<PositionModel>('Position', PositionSchema)