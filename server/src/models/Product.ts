import { Schema, model, Document, Types } from 'mongoose';

export interface IProductVariant {
  name: string;
  price: number;
  stock: number;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: Types.ObjectId;
  images: string[];
  stock: number;
  variants?: IProductVariant[];
  createdAt: Date;
  updatedAt: Date;
}

const productVariantSchema = new Schema<IProductVariant>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0.01 },
    stock: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, minlength: 1 },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0.01 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{ type: String, trim: true }],
    stock: { type: Number, required: true, min: 0 },
    variants: [productVariantSchema],
  },
  { timestamps: true }
);

productSchema.index({ name: 'text' });
productSchema.index({ price: 1 });

export default model<IProduct>('Product', productSchema);
