
import mongoose, { Schema, Document, Model } from "mongoose";

// 1. Define the TypeScript Interface (for code completion)
export interface IUser extends Document {
    email: string;
    username: string;
    password?: string;
}

// 2. Define the Mongoose Schema (for database validation)
const UserSchema: Schema = new Schema({
    email: { type: String, unique: true, required: true},
    username: { type: String, required: true },
    password: { type: String, required: true },
});

// 3. Export the Model
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);