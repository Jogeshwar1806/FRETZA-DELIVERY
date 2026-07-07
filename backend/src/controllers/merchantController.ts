import { Response, NextFunction } from 'express';
import { Restaurant } from '../models/restaurantModel.js';
import { FoodItem } from '../models/foodItemModel.js';
import { Category } from '../models/categoryModel.js';
import { Order } from '../models/orderModel.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { AppError } from '../middleware/errorMiddleware.js';
import mongoose from 'mongoose';

// Get Merchant's Restaurant Helper
const getMerchantRestaurant = async (req: AuthenticatedRequest, next: NextFunction) => {
  if (!req.user) {
    throw new AppError('User session not found', 401);
  }
  const restaurant = await Restaurant.findOne({ ownerId: req.user.id });
  if (!restaurant) {
    throw new AppError('No restaurant associated with this merchant account', 404);
  }
  return restaurant;
};

// --- PROFILE ---
export const getRestaurantProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const restaurant = await getMerchantRestaurant(req, next);
    res.status(200).json({ success: true, restaurant });
  } catch (error) {
    next(error);
  }
};

export const updateRestaurantProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const restaurant = await getMerchantRestaurant(req, next);
    const updates = req.body;

    // Filter out restricted fields
    delete updates.ownerId;
    delete updates.rating;

    const updated = await Restaurant.findByIdAndUpdate(restaurant._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Restaurant profile updated successfully',
      restaurant: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const createRestaurantProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('User not authorized', 401));
    }

    const existing = await Restaurant.findOne({ ownerId: req.user.id });
    if (existing) {
      return next(new AppError('You already own a restaurant profile', 400));
    }

    const restaurant = await Restaurant.create({
      ...req.body,
      ownerId: req.user.id,
      rating: 4.0,
      deliveryTime: req.body.deliveryTime || '25-30 min',
      distance: req.body.distance || '1.0 km',
      costForTwo: req.body.costForTwo || 250,
      status: 'Open',
    });

    res.status(201).json({
      success: true,
      message: 'Restaurant profile created successfully',
      restaurant,
    });
  } catch (error) {
    next(error);
  }
};

// --- MENU CRUD ---
export const getMenu = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const restaurant = await getMerchantRestaurant(req, next);
    const foodItems = await FoodItem.find({ restaurantId: restaurant._id });
    res.status(200).json({ success: true, count: foodItems.length, menu: foodItems });
  } catch (error) {
    next(error);
  }
};

export const addMenuItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const restaurant = await getMerchantRestaurant(req, next);
    const {
      name,
      description,
      price,
      discountPrice,
      image,
      category,
      preparationTime,
      availableQuantity,
      isVeg,
      isNonVeg,
      bestSeller,
      recommended,
      todaySpecial,
    } = req.body;

    const item = await FoodItem.create({
      name,
      description,
      price,
      discountPrice,
      image,
      category,
      preparationTime,
      availableQuantity,
      isVeg,
      isNonVeg: isNonVeg || !isVeg,
      bestSeller: !!bestSeller,
      recommended: !!recommended,
      todaySpecial: !!todaySpecial,
      restaurantId: restaurant._id,
    });

    res.status(201).json({
      success: true,
      message: 'Food item added to menu successfully',
      item,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const restaurant = await getMerchantRestaurant(req, next);
    const { itemId } = req.params;

    const item = await FoodItem.findOne({ _id: itemId, restaurantId: restaurant._id });
    if (!item) {
      return next(new AppError('Food item not found in your menu', 404));
    }

    const updated = await FoodItem.findByIdAndUpdate(itemId, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      item: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMenuItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const restaurant = await getMerchantRestaurant(req, next);
    const { itemId } = req.params;

    const item = await FoodItem.findOneAndDelete({ _id: itemId, restaurantId: restaurant._id });
    if (!item) {
      return next(new AppError('Food item not found in your menu', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// --- CATEGORIES ---
export const getCategories = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

export const addCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { name, icon } = req.body;
    const existing = await Category.findOne({ name });
    if (existing) {
      return next(new AppError('Category with this name already exists', 400));
    }

    const category = await Category.create({ name, icon: icon || 'restaurant' });
    res.status(201).json({ success: true, message: 'Category created', category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
    if (!category) {
      return next(new AppError('Category not found', 404));
    }
    res.status(200).json({ success: true, message: 'Category updated', category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return next(new AppError('Category not found', 404));
    }
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

// --- ORDERS ---
export const getOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const restaurant = await getMerchantRestaurant(req, next);
    const { status, date } = req.query;

    const filterQuery: any = { restaurantId: restaurant._id };

    if (status && status !== 'all') {
      filterQuery.status = status;
    }

    if (date) {
      const searchDate = new Date(date as string);
      const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
      filterQuery.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    // Sort by recent first
    const orders = await Order.find(filterQuery)
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const restaurant = await getMerchantRestaurant(req, next);
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['Accepted', 'Preparing', 'Ready for Pickup', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid order status transition requested', 400));
    }

    const order = await Order.findOneAndUpdate(
      { _id: orderId, restaurantId: restaurant._id },
      { status },
      { new: true }
    );

    if (!order) {
      return next(new AppError('Order not found under your restaurant account', 404));
    }

    res.status(200).json({
      success: true,
      message: `Order status moved to ${status}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// --- ANALYTICS ---
export const getAnalytics = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const restaurant = await getMerchantRestaurant(req, next);

    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    
    // Reset now object
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - 7));
    
    const todayMonth = new Date();
    const startOfMonth = new Date(todayMonth.setDate(todayMonth.getDate() - 30));

    // Today's Orders & Revenue
    const todayOrdersQuery = await Order.find({
      restaurantId: restaurant._id,
      createdAt: { $gte: startOfToday },
    });

    const todayOrdersCount = todayOrdersQuery.length;
    const todayRevenue = todayOrdersQuery
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.grandTotal, 0);

    // Weekly Revenue
    const weeklyOrders = await Order.find({
      restaurantId: restaurant._id,
      createdAt: { $gte: startOfWeek },
      status: { $ne: 'Cancelled' },
    });
    const weeklyRevenue = weeklyOrders.reduce((sum, o) => sum + o.grandTotal, 0);

    // Monthly Revenue
    const monthlyOrders = await Order.find({
      restaurantId: restaurant._id,
      createdAt: { $gte: startOfMonth },
      status: { $ne: 'Cancelled' },
    });
    const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + o.grandTotal, 0);

    // Total Unique Customers
    const allOrders = await Order.find({ restaurantId: restaurant._id });
    const uniqueCustomerIds = new Set(allOrders.map((o) => o.userId.toString()));
    const totalCustomers = uniqueCustomerIds.size;

    // Best Selling Items Calculation
    const foodSalesMap: { [key: string]: { name: string; qty: number; revenue: number } } = {};
    allOrders.forEach((order) => {
      if (order.status !== 'Cancelled') {
        order.items.forEach((item) => {
          const key = item.foodItemId ? item.foodItemId.toString() : item.name;
          if (foodSalesMap[key]) {
            foodSalesMap[key].qty += item.quantity;
            foodSalesMap[key].revenue += item.price * item.quantity;
          } else {
            foodSalesMap[key] = {
              name: item.name,
              qty: item.quantity,
              revenue: item.price * item.quantity,
            };
          }
        });
      }
    });

    const bestSellingItems = Object.values(foodSalesMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      analytics: {
        todayOrders: todayOrdersCount,
        todayRevenue,
        weeklyRevenue,
        monthlyRevenue,
        totalCustomers,
        averageRating: restaurant.rating,
        bestSellers: bestSellingItems,
      },
    });
  } catch (error) {
    next(error);
  }
};
