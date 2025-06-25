import { Schema, model, Document } from 'mongoose';

export interface IPolicy extends Document {
  title: string;           
  type: string;        
  content: string;        
  createdAt: Date;
  updatedAt: Date;
}

const policySchema = new Schema<IPolicy>(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    content: { type: String, required: true }, // Can store markdown or HTML
  },
  { timestamps: true }
);

export default model<IPolicy>('Policy', policySchema);
