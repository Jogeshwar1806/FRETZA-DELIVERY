import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress {
  _id?: any;
  label: 'Home' | 'Work' | 'Other';
  details: string;
  isDefault?: boolean;
  houseNumber?: string;
  street?: string;
  village?: string;
  landmark?: string;
  pincode?: string;
  district?: string;
  state?: string;
  lat?: number;
  lng?: number;
}

export interface IDeliveryProfile {
  vehicleType: string;
  vehicleNumber: string;
  isVerified: boolean;
  isOnline: boolean;
}

export interface IUser extends Document {
  name: string;
  phone: string;
  email?: string;
  password?: string;
  role: 'Customer' | 'Restaurant Owner' | 'Delivery Partner' | 'Admin';
  avatar?: string;
  addresses: IAddress[];
  deliveryProfile?: IDeliveryProfile;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  label: {
    type: String,
    enum: ['Home', 'Work', 'Other'],
    required: true,
  },
  details: {
    type: String,
    default: '',
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  houseNumber: { type: String, default: '' },
  street: { type: String, default: '' },
  village: { type: String, default: '' },
  landmark: { type: String, default: '' },
  pincode: { type: String, default: '' },
  district: { type: String, default: '' },
  state: { type: String, default: '' },
  lat: { type: Number },
  lng: { type: Number },
});

const DeliveryProfileSchema = new Schema<IDeliveryProfile>({
  vehicleType: { type: String, default: '' },
  vehicleNumber: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  isOnline: { type: Boolean, default: false },
});

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['Customer', 'Restaurant Owner', 'Delivery Partner', 'Admin'],
      default: 'Customer',
    },
    avatar: {
      type: String,
      default: '',
    },
    addresses: [AddressSchema],
    deliveryProfile: {
      type: DeliveryProfileSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to concatenate details from granular address fields
UserSchema.pre('save', function (next) {
  if (this.addresses) {
    this.addresses.forEach((addr) => {
      if (addr.houseNumber || addr.street || addr.village || addr.pincode) {
        const parts = [
          addr.houseNumber,
          addr.street,
          addr.village,
          addr.landmark ? `Near ${addr.landmark}` : '',
          addr.pincode,
          addr.district,
          addr.state,
        ].filter((p) => p && p.trim().length > 0);
        
        if (parts.length > 0) {
          addr.details = parts.join(', ');
        }
      }
    });
  }
  next();
});

export const User = mongoose.model<IUser>('User', UserSchema);
