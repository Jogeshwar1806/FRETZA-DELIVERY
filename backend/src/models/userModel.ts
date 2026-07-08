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
  aadhaarNumber?: string;
  aadhaarCard?: string;
  drivingLicenseNumber?: string;
  drivingLicense?: string;
  profilePhoto?: string;
}

export interface IMerchantProfile {
  gstNumber?: string;
  fssaiLicense?: string;
  panNumber?: string;
  restaurantName?: string;
  verificationStatus: 'Pending' | 'Approved' | 'Rejected';
  bankDetails?: {
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    accountHolderName?: string;
  };
}

export interface IUser extends Document {
  name: string;
  phone: string;
  email?: string;
  password?: string;
  role: 'customer' | 'driver' | 'restaurant_owner' | 'admin' | string;
  avatar?: string;
  addresses: IAddress[];
  deliveryProfile?: IDeliveryProfile;
  merchantProfile?: IMerchantProfile;
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
  aadhaarNumber: { type: String, default: '' },
  aadhaarCard: { type: String, default: '' },
  drivingLicenseNumber: { type: String, default: '' },
  drivingLicense: { type: String, default: '' },
  profilePhoto: { type: String, default: '' },
});

const MerchantProfileSchema = new Schema<IMerchantProfile>({
  gstNumber: { type: String, default: '' },
  fssaiLicense: { type: String, default: '' },
  panNumber: { type: String, default: '' },
  restaurantName: { type: String, default: '' },
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  bankDetails: {
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    bankName: { type: String, default: '' },
    accountHolderName: { type: String, default: '' },
  },
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
      enum: ['customer', 'driver', 'restaurant_owner', 'admin', 'Customer', 'Delivery Partner', 'Restaurant Owner', 'Admin'],
      default: 'customer',
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
    merchantProfile: {
      type: MerchantProfileSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to concatenate details from granular address fields and normalise roles
UserSchema.pre('save', function (next) {
  // Normalise role strings
  if (this.role) {
    if (this.role === 'Customer') this.role = 'customer';
    else if (this.role === 'Delivery Partner' || this.role === 'Driver') this.role = 'driver';
    else if (this.role === 'Restaurant Owner') this.role = 'restaurant_owner';
    else if (this.role === 'Admin') this.role = 'admin';
    else this.role = this.role.toLowerCase();
  }

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
