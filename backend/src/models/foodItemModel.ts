import mongoose, { Schema, Document } from 'mongoose';

export interface IFoodItem extends Document {
  name: string;
  description: string;
  price: number;
  image: string;
  rating?: number;
  isVeg: boolean;
  category: string;
  popular?: boolean;
  restaurantId?: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  discountPrice?: number;
  preparationTime?: string;
  availableQuantity?: number;
  availability: boolean;
  isNonVeg: boolean;
  bestSeller: boolean;
  recommended: boolean;
  todaySpecial: boolean;
}

const FoodItemSchema = new Schema<IFoodItem>(
  {
    name: {
      type: String,
      required: [true, 'Please provide food item name'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide price'],
    },
    image: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      required: [true, 'Please specify menu section category'],
      trim: true,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: false,
      default: null,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Food item must belong to an owner (merchant)'],
    },
    discountPrice: {
      type: Number,
    },
    preparationTime: {
      type: String,
      default: '20 min',
    },
    availableQuantity: {
      type: Number,
      default: 50,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    isNonVeg: {
      type: Boolean,
      default: false,
    },
    bestSeller: {
      type: Boolean,
      default: false,
    },
    recommended: {
      type: Boolean,
      default: false,
    },
    todaySpecial: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const FoodItem = mongoose.model<IFoodItem>('FoodItem', FoodItemSchema);
