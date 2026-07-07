import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  id: string; // virtual or explicit mapping
  name: string;
  icon: string;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Please provide category name'],
      unique: true,
      trim: true,
    },
    icon: {
      type: String,
      required: [true, 'Please provide category icon class'],
    },
  },
  {
    timestamps: true,
  }
);

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
