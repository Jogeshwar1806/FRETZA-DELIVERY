import { Response, NextFunction } from 'express';
import { Cart } from '../models/cartModel.js';
import { Order } from '../models/orderModel.js';
import { Restaurant } from '../models/restaurantModel.js';
import { calculateCartPricing } from './cartController.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const placeOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));
    const { deliveryAddress, paymentMethod, deliveryInstructions, orderNotes } = req.body;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart || cart.items.length === 0) {
      return next(new AppError('Your shopping cart is empty', 400));
    }

    // Verify restaurant is Open
    const restaurant = await Restaurant.findById(cart.restaurantId);
    if (!restaurant) {
      return next(new AppError('Restaurant not found', 404));
    }
    if (restaurant.status === 'Closed') {
      return next(new AppError(`${restaurant.name} is currently closed and not accepting orders.`, 400));
    }

    // Calculate secure pricing server-side
    const pricing = await calculateCartPricing(cart);

    // Map items list for Order document
    const orderItems = pricing.items.map((item) => ({
      foodItemId: item.menuItem.id,
      name: item.menuItem.name,
      price: item.menuItem.discountPrice || item.menuItem.price,
      quantity: item.quantity,
    }));

    // Create Order
    const order = await Order.create({
      restaurantId: cart.restaurantId,
      restaurantName: pricing.restaurantName,
      userId: req.user.id,
      items: orderItems,
      subtotal: pricing.pricing.subtotal,
      packagingFee: pricing.pricing.packagingFee,
      taxes: pricing.pricing.taxes,
      deliveryFee: pricing.pricing.deliveryFee,
      discount: pricing.pricing.discount,
      grandTotal: pricing.pricing.grandTotal,
      status: 'Pending',
      deliveryAddress: deliveryAddress || 'Address not specified',
      paymentMethod: paymentMethod || 'Cash on Delivery',
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
      couponCode: pricing.couponCode || undefined,
      deliveryInstructions,
      orderNotes,
    });

    // Clear user cart
    cart.items = [];
    cart.restaurantId = null;
    cart.couponCode = null;
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));

    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('userId', 'name phone email')
      .populate('restaurantId', 'address ownerId contactNumber distance');

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    const normalizedRole = req.user.role?.toLowerCase();

    // Authorization checks
    if (normalizedRole === 'admin') {
      // Admin can view everything
    } else if (normalizedRole === 'delivery partner' || normalizedRole === 'driver') {
      // Driver can view if they are assigned, or if the order is ready for pickup and unassigned
      const isAssigned = order.deliveryPartnerId?.toString() === req.user.id;
      const isAvailable = !order.deliveryPartnerId && order.status === 'Ready for Pickup';
      if (!isAssigned && !isAvailable) {
        return next(new AppError('Unauthorized to view this order', 403));
      }
    } else if (normalizedRole === 'restaurant_owner' || normalizedRole === 'restaurant owner') {
      // Merchant can view if the order belongs to one of their restaurants
      const restaurant = await Restaurant.findById(order.restaurantId);
      if (!restaurant || restaurant.ownerId.toString() !== req.user.id) {
        return next(new AppError('Unauthorized to view this order', 403));
      }
    } else {
      // Customer can view if it's their order
      if (order.userId._id.toString() !== req.user.id) {
        return next(new AppError('Unauthorized to view this order', 403));
      }
    }

    // Attach details as flat fields for ease of frontend consumption
    const orderObj = order.toObject() as any;
    orderObj.restaurantAddress = (order.restaurantId as any)?.address || '';
    orderObj.restaurantPhone = (order.restaurantId as any)?.contactNumber || '';
    orderObj.customerName = (order.userId as any)?.name || '';
    orderObj.customerPhone = (order.userId as any)?.phone || '';
    orderObj.distance = (order.restaurantId as any)?.distance || '1.5 km';

    res.status(200).json({
      success: true,
      order: orderObj,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, userId: req.user.id });
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (order.status !== 'Pending') {
      return next(new AppError('Only pending orders can be cancelled', 400));
    }

    order.status = 'Cancelled';
    order.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
    });
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};
