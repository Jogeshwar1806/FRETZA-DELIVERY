import mongoose, { Schema, Document } from 'mongoose';

export interface ITicketReply {
  senderId: mongoose.Types.ObjectId;
  name: string;
  message: string;
  timestamp: Date;
}

export interface ITicket extends Document {
  userId: mongoose.Types.ObjectId;
  userRole: 'Customer' | 'Restaurant Owner' | 'Delivery Partner';
  subject: string;
  description: string;
  category: 'Complaint' | 'Enquiry' | 'Technical' | 'Billing';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  replies: ITicketReply[];
  createdAt: Date;
  updatedAt: Date;
}

const TicketReplySchema = new Schema<ITicketReply>({
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const TicketSchema = new Schema<ITicket>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userRole: { type: String, enum: ['Customer', 'Restaurant Owner', 'Delivery Partner'], required: true },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, enum: ['Complaint', 'Enquiry', 'Technical', 'Billing'], default: 'Enquiry' },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
    replies: [TicketReplySchema],
  },
  {
    timestamps: true,
  }
);

export const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);
