import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: 'customer' | 'admin';
  isAccountVerified: boolean;
  resetLink?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    isAccountVerified: { type: Boolean, default: false },
    resetLink: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

export default model<IUser>('User', userSchema);
