import { Schema, model, Document, Types } from 'mongoose';

export interface IOTP extends Document {
  email: string;
  otp: string;
  expirationTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

const otpSchema = new Schema<IOTP>(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expirationTime: { type: Date, required: true },
  },
  { timestamps: true }
);

export default model<IOTP>('OTP', otpSchema);
