import mongoose, { Schema, Document } from 'mongoose';

export interface IRestaurantOffer {
  code: string;
  text: string;
}

export interface ICoordinates {
  lat: number;
  lng: number;
}

export interface IRestaurant extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  distance: string;
  costForTwo: number;
  image: string;
  coverImage: string;
  tags: string[];
  address: string;
  featured?: boolean;
  offers: IRestaurantOffer[];
  description?: string;
  logo?: string;
  openingTime?: string;
  closingTime?: string;
  deliveryRadius?: number;
  contactNumber?: string;
  status: 'Open' | 'Closed';
  coordinates?: ICoordinates;
}

const RestaurantOfferSchema = new Schema<IRestaurantOffer>({
  code: { type: String, required: true },
  text: { type: String, required: true },
});

const CoordinatesSchema = new Schema<ICoordinates>({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
});

const RestaurantSchema = new Schema<IRestaurant>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide restaurant name'],
      trim: true,
    },
    cuisine: {
      type: String,
      required: [true, 'Please specify cuisines'],
      trim: true,
    },
    rating: {
      type: Number,
      default: 4.0,
    },
    deliveryTime: {
      type: String,
      required: true,
    },
    distance: {
      type: String,
      required: true,
    },
    costForTwo: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    tags: [{ type: String }],
    address: {
      type: String,
      required: [true, 'Please provide shop address'],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    offers: [RestaurantOfferSchema],
    description: {
      type: String,
      default: '',
    },
    logo: {
      type: String,
      default: '',
    },
    openingTime: {
      type: String,
      default: '09:00 AM',
    },
    closingTime: {
      type: String,
      default: '10:00 PM',
    },
    deliveryRadius: {
      type: Number,
      default: 5, // in km
    },
    contactNumber: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Open', 'Closed'],
      default: 'Open',
    },
    coordinates: CoordinatesSchema,
  },
  {
    timestamps: true,
  }
);

export const Restaurant = mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
