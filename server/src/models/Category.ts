import { Schema, model, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  parentId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  },
  { timestamps: true }
);

export default model<ICategory>('Category', categorySchema);
