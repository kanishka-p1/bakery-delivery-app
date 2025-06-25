import { Schema, model, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;               
  description?: string;  
  percentage: number;          
  minCartValue: number;    
  maxDiscount: number;
  validFrom: Date;          
  validTo: Date;          
  isActive: boolean;
  usageLimit?: number;      
  usedCount: number;        
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    percentage: { type: Number, required: true, min: 1, max: 100 },
    minCartValue: { type: Number, required: true, min: 0 },
    maxDiscount: { type: Number, required: true, min: 0 },
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number, min: 1 },
    usedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model<ICoupon>('Coupon', couponSchema);
