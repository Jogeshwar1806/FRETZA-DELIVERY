import { Response, NextFunction } from 'express';
import { Order } from '../models/orderModel.js';
import { User } from '../models/userModel.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Completed deliveries count
    const completedCount = await Order.countDocuments({
      deliveryPartnerId: req.user.id,
      deliveryStatus: 'Delivered',
      updatedAt: { $gte: todayStart },
    });

    // Earnings calculation: ₹40 per delivery base + distance placeholders
    const basePay = completedCount * 40;
    const distanceBonus = completedCount * 12; // average distance bonus placeholder
    const todayEarnings = basePay + distanceBonus;

    // Active assignment (if any)
    const activeOrder = await Order.findOne({
      deliveryPartnerId: req.user.id,
      deliveryStatus: { $in: ['Accepted', 'Travelling to Restaurant', 'Reached Restaurant', 'Picked Up', 'Travelling to Customer'] },
    });

    res.status(200).json({
      success: true,
      stats: {
        completedCount,
        todayEarnings,
        activeOrderId: activeOrder ? activeOrder._id : null,
        activeOrder: activeOrder || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailableOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));

    // Check if rider is online
    const user = await User.findById(req.user.id);
    if (!user || !user.deliveryProfile?.isOnline) {
      return res.status(200).json({
        success: true,
        offline: true,
        message: 'Rider is currently Offline. Go Online to receive orders.',
        orders: [],
      });
    }

    // Orders that are Ready for Pickup and not assigned
    const orders = await Order.find({
      status: 'Ready for Pickup',
      deliveryPartnerId: null,
    })
      .populate('restaurantId')
      .populate('userId')
      .sort({ createdAt: 1 });

    const formattedOrders = orders.map((order) => {
      const orderObj = order.toObject() as any;
      orderObj.restaurantAddress = (order.restaurantId as any)?.address || '';
      orderObj.restaurantPhone = (order.restaurantId as any)?.contactNumber || '';
      orderObj.customerName = (order.userId as any)?.name || '';
      orderObj.customerPhone = (order.userId as any)?.phone || '';
      orderObj.distance = (order.restaurantId as any)?.distance || '1.5 km';
      return orderObj;
    });

    res.status(200).json({
      success: true,
      count: formattedOrders.length,
      orders: formattedOrders,
    });
  } catch (error) {
    next(error);
  }
};

export const acceptOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));
    const { orderId } = req.params;

    // Verify rider is Online
    const user = await User.findById(req.user.id);
    if (!user || !user.deliveryProfile?.isOnline) {
      return next(new AppError('You must go Online before accepting orders', 400));
    }

    // Check if rider already has an active order
    const activeOrder = await Order.findOne({
      deliveryPartnerId: req.user.id,
      deliveryStatus: { $in: ['Accepted', 'Travelling to Restaurant', 'Reached Restaurant', 'Picked Up', 'Travelling to Customer'] },
    });
    if (activeOrder) {
      return next(new AppError('You already have an active delivery assignment', 400));
    }

    // Atomically find and assign the order
    const order = await Order.findOneAndUpdate(
      { _id: orderId, status: 'Ready for Pickup', deliveryPartnerId: null },
      {
        deliveryPartnerId: req.user.id,
        deliveryStatus: 'Accepted',
        $push: {
          deliveryTimeline: { status: 'Accepted', timestamp: new Date() },
        },
      },
      { new: true }
    );

    if (!order) {
      return next(new AppError('Order has already been accepted by another partner or is unavailable', 400));
    }

    res.status(200).json({
      success: true,
      message: 'Delivery accepted successfully!',
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Simple success return (rejection logging is optional for V1)
  res.status(200).json({
    success: true,
    message: 'Order rejected (dismissed from queue)',
  });
};

export const updateDeliveryStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));
    const { orderId } = req.params;
    const { status } = req.body; // Travelling to Restaurant, Reached Restaurant, Picked Up, Travelling to Customer, Delivered, Failed

    const order = await Order.findOne({ _id: orderId, deliveryPartnerId: req.user.id });
    if (!order) {
      return next(new AppError('Active delivery assignment not found', 404));
    }

    order.deliveryStatus = status;
    order.deliveryTimeline.push({
      status,
      timestamp: new Date(),
    });

    // Workflow triggers:
    if (status === 'Picked Up') {
      // Transition order status to Out for Delivery
      order.status = 'Out for Delivery';
      order.statusHistory.push({
        status: 'Out for Delivery',
        timestamp: new Date(),
      });
    } else if (status === 'Delivered') {
      // Complete order
      order.status = 'Delivered';
      order.statusHistory.push({
        status: 'Delivered',
        timestamp: new Date(),
      });
      if (order.paymentMethod === 'Cash on Delivery') {
        order.paymentStatus = 'Paid';
      }
    } else if (status === 'Failed') {
      // Mark as Rejected/Failed
      order.status = 'Cancelled';
      order.statusHistory.push({
        status: 'Cancelled',
        timestamp: new Date(),
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Delivery status updated to: ${status}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const getDeliveryHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));

    const orders = await Order.find({
      deliveryPartnerId: req.user.id,
      deliveryStatus: { $in: ['Delivered', 'Failed', 'Cancelled'] },
    })
      .populate('restaurantId')
      .populate('userId')
      .sort({ updatedAt: -1 });

    const formattedOrders = orders.map((order) => {
      const orderObj = order.toObject() as any;
      orderObj.restaurantAddress = (order.restaurantId as any)?.address || '';
      orderObj.restaurantPhone = (order.restaurantId as any)?.contactNumber || '';
      orderObj.customerName = (order.userId as any)?.name || '';
      orderObj.customerPhone = (order.userId as any)?.phone || '';
      orderObj.distance = (order.restaurantId as any)?.distance || '1.5 km';
      return orderObj;
    });

    res.status(200).json({
      success: true,
      count: formattedOrders.length,
      orders: formattedOrders,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRiderProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));
    const { vehicleType, vehicleNumber, isOnline } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return next(new AppError('User not found', 404));

    if (!user.deliveryProfile) {
      user.deliveryProfile = {
        vehicleType: '',
        vehicleNumber: '',
        isVerified: false,
        isOnline: false,
      };
    }

    if (vehicleType !== undefined) user.deliveryProfile.vehicleType = vehicleType;
    if (vehicleNumber !== undefined) user.deliveryProfile.vehicleNumber = vehicleNumber;
    if (isOnline !== undefined) user.deliveryProfile.isOnline = isOnline;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Rider status updated successfully',
      profile: user.deliveryProfile,
    });
  } catch (error) {
    next(error);
  }
};
