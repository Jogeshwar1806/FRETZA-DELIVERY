import { Response, NextFunction } from 'express';
import { User } from '../models/userModel.js';
import { Restaurant } from '../models/restaurantModel.js';
import { Order } from '../models/orderModel.js';
import { Coupon } from '../models/couponModel.js';
import { Ticket } from '../models/ticketModel.js';
import { AuditLog } from '../models/auditLogModel.js';
import { Category } from '../models/categoryModel.js';
import { PlatformSettings } from '../models/platformSettingsModel.js';
import { logActivity } from '../utils/auditLogger.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const getPlatformStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));

    const totalCustomers = await User.countDocuments({ role: 'Customer' });
    const totalRestaurants = await Restaurant.countDocuments();
    const totalDeliveryPartners = await User.countDocuments({ role: 'Delivery Partner' });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const monthStart = new Date();
    monthStart.setHours(0, 0, 0, 0);
    monthStart.setDate(1);

    const ordersToday = await Order.countDocuments({ createdAt: { $gte: todayStart } });
    const ordersThisWeek = await Order.countDocuments({ createdAt: { $gte: weekStart } });

    // Revenue calculations
    const revenueTodayRaw = await Order.aggregate([
      { $match: { status: 'Delivered', createdAt: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);
    const revenueToday = revenueTodayRaw[0]?.total || 0;

    const revenueThisMonthRaw = await Order.aggregate([
      { $match: { status: 'Delivered', createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);
    const revenueThisMonth = revenueThisMonthRaw[0]?.total || 0;

    // Top Restaurants
    const topRestaurants = await Order.aggregate([
      { $match: { status: 'Delivered' } },
      { $group: { _id: '$restaurantName', count: { $sum: 1 }, sales: { $sum: '$grandTotal' } } },
      { $sort: { sales: -1 } },
      { $limit: 5 },
    ]);

    // Top Selling Foods
    const topFoods = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.name', quantity: { $sum: '$items.quantity' } } },
      { $sort: { quantity: -1 } },
      { $limit: 5 },
    ]);

    // Cancellation calculations
    const totalOrdersCount = await Order.countDocuments();
    const cancelledOrdersCount = await Order.countDocuments({ status: 'Cancelled' });
    const cancellationRate = totalOrdersCount > 0 ? Math.round((cancelledOrdersCount / totalOrdersCount) * 100) : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalCustomers,
        totalRestaurants,
        totalDeliveryPartners,
        ordersToday,
        ordersThisWeek,
        revenueToday,
        revenueThisMonth,
        cancellationRate,
        averageDeliveryTime: '24 min',
        topRestaurants: topRestaurants.map((r) => ({ name: r._id, count: r.count, sales: r.sales })),
        topFoods: topFoods.map((f) => ({ name: f._id, quantity: f.quantity })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPlatformUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { role } = req.query;
    const filter: any = {};
    if (role) filter.role = role;

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { role, isVerified, isOnline, verificationStatus } = req.body;

    const user = await User.findById(userId);
    if (!user) return next(new AppError('User not found', 404));

    if (role) user.role = role;
    if (user.deliveryProfile) {
      if (isVerified !== undefined) user.deliveryProfile.isVerified = isVerified;
      if (isOnline !== undefined) user.deliveryProfile.isOnline = isOnline;
    }
    if (user.merchantProfile && verificationStatus !== undefined) {
      user.merchantProfile.verificationStatus = verificationStatus;
    }

    await user.save();

    await logActivity(
      req.user!.id,
      req.user!.name,
      'Update User Profile',
      'Users',
      `Modified user permissions/role for user ${user.name} (${user.phone})`
    );

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const getPlatformRestaurants = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, restaurants });
  } catch (error) {
    next(error);
  }
};

export const updateMerchantApproval = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { restaurantId } = req.params;
    const { status, featured } = req.body; // status: Open, Closed

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return next(new AppError('Restaurant not found', 404));

    if (status) restaurant.status = status;
    if (featured !== undefined) restaurant.featured = featured;

    await restaurant.save();

    await logActivity(
      req.user!.id,
      req.user!.name,
      'Update Merchant Settings',
      'Merchants',
      `Modified approval configurations for outlet: ${restaurant.name}`
    );

    res.status(200).json({ success: true, restaurant });
  } catch (error) {
    next(error);
  }
};

export const getPlatformOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

export const getPricingSettings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create({});
    }
    res.status(200).json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

export const updatePricingEngine = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const updates = req.body;

    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create({});
    }

    Object.assign(settings, updates);
    await settings.save();

    await logActivity(
      req.user!.id,
      req.user!.name,
      'Update Platform Pricing',
      'Settings',
      `Modified global platform fees, radius scope, and parameters.`
    );

    res.status(200).json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

// --- COUPON CRUD ---
export const getCoupons = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { code, discount, isPercentage, expiry, minOrder, maxDiscount, status } = req.body;

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discount,
      isPercentage,
      expiry,
      minOrder,
      maxDiscount,
      status,
    });

    await logActivity(
      req.user!.id,
      req.user!.name,
      'Create Coupon',
      'Coupons',
      `Created new coupon promo: ${coupon.code}`
    );

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { couponId } = req.params;
    const updates = req.body;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) return next(new AppError('Coupon not found', 404));

    if (updates.code) updates.code = updates.code.toUpperCase();
    Object.assign(coupon, updates);
    await coupon.save();

    await logActivity(
      req.user!.id,
      req.user!.name,
      'Update Coupon',
      'Coupons',
      `Modified settings for coupon code: ${coupon.code}`
    );

    res.status(200).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { couponId } = req.params;

    const coupon = await Coupon.findByIdAndDelete(couponId);
    if (!coupon) return next(new AppError('Coupon not found', 404));

    await logActivity(
      req.user!.id,
      req.user!.name,
      'Delete Coupon',
      'Coupons',
      `Deleted coupon code: ${coupon.code}`
    );

    res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// --- SUPPORT TICKETS ---
export const getTickets = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const tickets = await Ticket.find().populate('userId', 'name phone').sort({ createdAt: -1 });
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    next(error);
  }
};

export const replyTicket = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return next(new AppError('Ticket not found', 404));

    ticket.replies.push({
      senderId: req.user!.id,
      name: req.user!.name,
      message,
      timestamp: new Date(),
    });

    ticket.status = 'In Progress';
    await ticket.save();

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

// --- AUDIT LOGS ---
export const getAuditLogs = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.status(200).json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};

// --- CATEGORIES ---
export const getCategories = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { name, icon } = req.body;
    if (!name) return next(new AppError('Please provide category name', 400));
    
    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      return next(new AppError('Category with this name already exists', 400));
    }

    const category = await Category.create({ name, icon: icon || 'restaurant' });
    
    await logActivity(
      req.user!.id,
      req.user!.name,
      'Create Category',
      'Categories',
      `Created new master category: ${name}`
    );

    res.status(201).json({ success: true, message: 'Category created successfully', category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { categoryId } = req.params;
    const { name, icon } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) return next(new AppError('Category not found', 404));

    if (name) {
      const existing = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: categoryId }
      });
      if (existing) {
        return next(new AppError('Category with this name already exists', 400));
      }
      category.name = name;
    }
    if (icon) category.icon = icon;

    await category.save();

    await logActivity(
      req.user!.id,
      req.user!.name,
      'Update Category',
      'Categories',
      `Updated category details for: ${category.name}`
    );

    res.status(200).json({ success: true, message: 'Category updated successfully', category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) return next(new AppError('Category not found', 404));

    await Category.findByIdAndDelete(categoryId);

    await logActivity(
      req.user!.id,
      req.user!.name,
      'Delete Category',
      'Categories',
      `Deleted category: ${category.name}`
    );

    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};
