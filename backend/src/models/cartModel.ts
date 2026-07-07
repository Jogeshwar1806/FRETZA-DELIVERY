import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  foodItemId: mongoose.Types.ObjectId;
  quantity: number;
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId | null;
  items: ICartItem[];
  couponCode: string | null;
}

const CartItemSchema = new Schema<ICartItem>({
  foodItemId: {
    type: Schema.Types.ObjectId,
    ref: 'FoodItem',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      default: null,
    },
    items: [CartItemSchema],
    couponCode: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Cart = mongoose.model<ICart>('Cart', CartSchema);
