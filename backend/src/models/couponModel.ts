import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discount: number; // e.g. 0.1 for 10% or flat amount like 50
  isPercentage: boolean;
  expiry: Date;
  minOrder: number;
  maxDiscount: number;
  status: 'Active' | 'Inactive';
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    isPercentage: {
      type: Boolean,
      default: false,
    },
    expiry: {
      type: Date,
      required: true,
    },
    minOrder: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number,
      default: 100, // Capped at flat amount
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);
