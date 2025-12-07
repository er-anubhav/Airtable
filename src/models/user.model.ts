import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    airtableUserId: string;
    accessToken: string;
    refreshToken: string;
    tokenExpiresAt: Date;
    scopes: string[];
    profile: {
        id?: string;
        email?: string;
        name?: string;
    };
    lastLogin: Date;
}

const UserSchema: Schema = new Schema({
    airtableUserId: { type: String, required: true, unique: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    tokenExpiresAt: { type: Date, required: true },
    scopes: [{ type: String }],
    profile: {
        id: String,
        email: String,
        name: String
    },
    lastLogin: { type: Date, default: Date.now }
}, {
    timestamps: true
});

export const User = mongoose.model<IUser>('User', UserSchema);
