import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  name: string;
  phone: string;
  email?: string;
  role: 'Customer' | 'Driver' | 'Merchant' | 'Admin' | string;
  feedbackType: 'Bug' | 'Suggestion' | 'Complaint' | 'Feature Request' | 'Other';
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    name: {
      type: String,
      required: [true, 'Please provide name'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide phone number'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Please specify role'],
    },
    feedbackType: {
      type: String,
      enum: ['Bug', 'Suggestion', 'Complaint', 'Feature Request', 'Other'],
      required: [true, 'Please specify feedback type'],
    },
    message: {
      type: String,
      required: [true, 'Please write your message'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Feedback = mongoose.model<IFeedback>('Feedback', FeedbackSchema);
