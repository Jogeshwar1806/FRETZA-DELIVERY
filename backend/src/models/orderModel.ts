import mongoose, { Schema, Document } from 'mongoose';

export interface IStatusHistory {
  status: 'Pending' | 'Accepted' | 'Preparing' | 'Ready for Pickup' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Rejected';
  timestamp: Date;
}

export interface IDeliveryTimeline {
  status: 'Assigned' | 'Accepted' | 'Travelling to Restaurant' | 'Reached Restaurant' | 'Picked Up' | 'Travelling to Customer' | 'Delivered' | 'Failed' | 'Cancelled';
  timestamp: Date;
}

export interface IOrder extends Document {
  restaurantId: mongoose.Types.ObjectId;
  restaurantName: string;
  userId: mongoose.Types.ObjectId;
  items: Array<{
    foodItemId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  packagingFee: number;
  taxes: number;
  deliveryFee: number;
  discount: number;
  grandTotal: number;
  status: 'Pending' | 'Accepted' | 'Preparing' | 'Ready for Pickup' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Rejected';
  statusHistory: IStatusHistory[];
  deliveryAddress: string;
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  couponCode?: string;
  deliveryInstructions?: string;
  orderNotes?: string;
  deliveryPartnerId: mongoose.Types.ObjectId | null;
  deliveryStatus: 'Assigned' | 'Accepted' | 'Travelling to Restaurant' | 'Reached Restaurant' | 'Picked Up' | 'Travelling to Customer' | 'Delivered' | 'Failed' | 'Cancelled' | null;
  deliveryTimeline: IDeliveryTimeline[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  foodItemId: { type: Schema.Types.ObjectId, ref: 'FoodItem', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const StatusHistorySchema = new Schema({
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered', 'Cancelled', 'Rejected'],
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
});

const DeliveryTimelineSchema = new Schema({
  status: {
    type: String,
    enum: ['Assigned', 'Accepted', 'Travelling to Restaurant', 'Reached Restaurant', 'Picked Up', 'Travelling to Customer', 'Delivered', 'Failed', 'Cancelled'],
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
});

const OrderSchema = new Schema<IOrder>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    restaurantName: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    packagingFee: { type: Number, default: 0 },
    taxes: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered', 'Cancelled', 'Rejected'],
      default: 'Pending',
    },
    statusHistory: [StatusHistorySchema],
    deliveryAddress: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    couponCode: { type: String },
    deliveryInstructions: { type: String },
    orderNotes: { type: String },
    deliveryPartnerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    deliveryStatus: {
      type: String,
      enum: ['Assigned', 'Accepted', 'Travelling to Restaurant', 'Reached Restaurant', 'Picked Up', 'Travelling to Customer', 'Delivered', 'Failed', 'Cancelled'],
      default: null,
    },
    deliveryTimeline: [DeliveryTimelineSchema],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: automatically initialize status history on first creation
OrderSchema.pre('save', function (next) {
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
    });
  }
  next();
});

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
