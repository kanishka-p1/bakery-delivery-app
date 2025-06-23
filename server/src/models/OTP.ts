import { Schema, model, Document, Types } from 'mongoose';

export interface IOTP extends Document {
  user: Types.ObjectId;
  otp: string;
  expirationTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

const otpSchema = new Schema<IOTP>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    otp: { type: String, required: true },
    expirationTime: { type: Date, required: true },
  },
  { timestamps: true }
);

export default model<IOTP>('OTP', otpSchema);
