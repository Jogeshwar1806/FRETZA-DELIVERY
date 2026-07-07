import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformSettings extends Document {
  platformFee: number;
  deliveryChargeBase: number;
  deliveryChargePerKm: number;
  freeDeliveryThreshold: number;
  taxRate: number;
  serviceRadius: number;
  maintenanceMode: boolean;
  appVersion: string;
}

const PlatformSettingsSchema = new Schema<IPlatformSettings>(
  {
    platformFee: { type: Number, default: 2 },
    deliveryChargeBase: { type: Number, default: 30 },
    deliveryChargePerKm: { type: Number, default: 10 },
    freeDeliveryThreshold: { type: Number, default: 299 },
    taxRate: { type: Number, default: 0.05 },
    serviceRadius: { type: Number, default: 10 },
    maintenanceMode: { type: Boolean, default: false },
    appVersion: { type: String, default: '1.0.0' },
  },
  {
    timestamps: true,
  }
);

export const PlatformSettings = mongoose.model<IPlatformSettings>('PlatformSettings', PlatformSettingsSchema);
