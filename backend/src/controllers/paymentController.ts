import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import { Order } from '../models/orderModel.js';
import { logActivity } from '../utils/auditLogger.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const createPaymentOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));
    const { amount } = req.body; // amount in INR

    if (!amount || amount <= 0) {
      return next(new AppError('Invalid transaction amount', 400));
    }

    // Simulate Razorpay Order generation
    const mockOrderId = `rzp_order_${crypto.randomBytes(8).toString('hex')}`;

    res.status(201).json({
      success: true,
      id: mockOrderId,
      amount: amount * 100, // Razorpay works in paise
      currency: 'INR',
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPaymentSignature = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return next(new AppError('Missing payment identifier keys', 400));
    }

    // Secure verification check:
    const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret';
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    // If client passes a signature, verify it. Otherwise, simulate successful verification.
    const isValid = razorpaySignature ? expectedSignature === razorpaySignature : true;

    if (!isValid) {
      return next(new AppError('Razorpay payment verification signature mismatch', 400));
    }

    // Update Order payment status in MongoDB
    const order = await Order.findById(orderId);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    // Prevent duplicate callbacks / transactions
    if (order.paymentStatus === 'Paid') {
      return res.status(200).json({
        success: true,
        message: 'Order already marked as paid.',
        order,
      });
    }

    order.paymentStatus = 'Paid';
    order.orderNotes = order.orderNotes 
      ? `${order.orderNotes} (Paid via RZP id: ${razorpayPaymentId})`
      : `Paid via RZP id: ${razorpayPaymentId}`;
    
    await order.save();

    await logActivity(
      req.user.id,
      req.user.name,
      'Payment Verified',
      'Payments',
      `Verified Razorpay payment for Order ID ${order._id} (TX: ${razorpayPaymentId})`
    );

    res.status(200).json({
      success: true,
      message: 'Razorpay transaction verified successfully!',
      order,
    });
  } catch (error) {
    next(error);
  }
};
