import { Schema } from "mongoose";
import { Document} from 'mongoose'
import ContactModel from "./ContactModel";

export default interface UserModel extends Document {
    outlookId: string,
    accessToken:  string,
    refreshToken: string,
    displayName: string,
    roles: Array<string>,
    bexioContact?: {
        id: Schema.Types.ObjectId,
        ref: 'Contact'
    } | ContactModel
}