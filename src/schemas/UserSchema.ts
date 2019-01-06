import { Schema } from "mongoose";

export const UserSchema: Schema = new Schema({
    outlookId: String,
    accessToken: String,
    refreshToken: String,
    displayName: String,
    roles: [{
        type: String
    }],
    bexioContact: {
        type: Schema.Types.ObjectId,
        ref: 'Contact',
        required: false
    }
})