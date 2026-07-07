import { Response, NextFunction } from 'express';
import { Cart } from '../models/cartModel.js';
import { FoodItem } from '../models/foodItemModel.js';
import { Coupon } from '../models/couponModel.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { AppError } from '../middleware/errorMiddleware.js';

// Helper: Calculate Cart Pricing Server-Side
export const calculateCartPricing = async (cart: any) => {
  let subtotal = 0;
  const itemsList: any[] = [];
  let restaurantId = cart.restaurantId;
  let restaurantName = '';

  if (cart.items.length > 0) {
    const foodItemIds = cart.items.map((i: any) => i.foodItemId);
    const foodItems = await FoodItem.find({ _id: { $in: foodItemIds } }).populate('restaurantId');

    cart.items.forEach((item: any) => {
      const food = foodItems.find((f) => f._id.toString() === item.foodItemId.toString());
      if (food && food.availability) {
        const price = food.discountPrice || food.price;
        subtotal += price * item.quantity;
        
        const rest: any = food.restaurantId;
        if (rest) {
          restaurantName = rest.name;
          restaurantId = rest._id;
        }

        itemsList.push({
          menuItem: {
            id: food.id,
            name: food.name,
            price: food.price,
            discountPrice: food.discountPrice,
            image: food.image,
            isVeg: food.isVeg,
            category: food.category,
            availability: food.availability,
          },
          quantity: item.quantity,
        });
      }
    });
  }

  // Set default fees
  const packagingFee = subtotal > 0 ? 15 : 0;
  const platformFee = subtotal > 0 ? 2 : 0;
  const taxes = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
  const deliveryFee = subtotal > 0 ? (subtotal >= 299 ? 0 : 30) : 0; // Free above 299

  // Calculate discount based on Coupon Code
  let discount = 0;
  let couponMessage = '';
  let validatedCoupon = null;

  if (cart.couponCode && subtotal > 0) {
    const coupon = await Coupon.findOne({ code: cart.couponCode.toUpperCase(), status: 'Active' });
    if (coupon) {
      const now = new Date();
      if (coupon.expiry > now) {
        if (subtotal >= coupon.minOrder) {
          if (coupon.isPercentage) {
            discount = Math.round(subtotal * coupon.discount);
          } else {
            discount = coupon.discount;
          }
          // Cap discount
          discount = Math.min(discount, coupon.maxDiscount, subtotal);
          validatedCoupon = coupon.code;
        } else {
          couponMessage = `Coupon requires a minimum order of ₹${coupon.minOrder}`;
        }
      } else {
        couponMessage = 'Coupon has expired';
      }
    } else {
      couponMessage = 'Coupon code is invalid';
    }
  }

  const grandTotal = Math.max(
    0,
    Math.round((subtotal + deliveryFee + packagingFee + platformFee + taxes - discount) * 100) / 100
  );

  return {
    restaurantId,
    restaurantName,
    couponCode: validatedCoupon,
    couponMessage,
    items: itemsList,
    pricing: {
      subtotal,
      deliveryFee,
      packagingFee,
      platformFee,
      taxes,
      discount,
      grandTotal,
    },
  };
};

export const getCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }

    const calculated = await calculateCartPricing(cart);
    res.status(200).json({ success: true, cart: calculated });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));
    const { foodItemId, quantity } = req.body;

    const food = await FoodItem.findById(foodItemId);
    if (!food) {
      return next(new AppError('Food item not found', 404));
    }

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }

    // Check if item is from a different restaurant
    if (cart.restaurantId && cart.restaurantId.toString() !== food.restaurantId.toString() && cart.items.length > 0) {
      return res.status(400).json({
        success: false,
        clearCartRequired: true,
        message: 'Items already in cart from another restaurant. Clear cart and add this item?',
      });
    }

    // Assign restaurant if cart empty
    if (cart.items.length === 0) {
      cart.restaurantId = food.restaurantId;
    }

    // Add or increment
    const existingIndex = cart.items.findIndex((i) => i.foodItemId.toString() === foodItemId);
    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity || 1;
    } else {
      cart.items.push({ foodItemId, quantity: quantity || 1 });
    }

    await cart.save();
    const calculated = await calculateCartPricing(cart);

    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      cart: calculated,
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuantity = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));
    const { foodItemId, quantity } = req.body;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return next(new AppError('Cart not found', 404));

    const existingIndex = cart.items.findIndex((i) => i.foodItemId.toString() === foodItemId);
    if (existingIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(existingIndex, 1);
      } else {
        cart.items[existingIndex].quantity = quantity;
      }
    }

    if (cart.items.length === 0) {
      cart.restaurantId = null;
      cart.couponCode = null;
    }

    await cart.save();
    const calculated = await calculateCartPricing(cart);

    res.status(200).json({
      success: true,
      message: 'Cart quantity updated',
      cart: calculated,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));
    const { foodItemId } = req.params;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return next(new AppError('Cart not found', 404));

    cart.items = cart.items.filter((i) => i.foodItemId.toString() !== foodItemId);

    if (cart.items.length === 0) {
      cart.restaurantId = null;
      cart.couponCode = null;
    }

    await cart.save();
    const calculated = await calculateCartPricing(cart);

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart: calculated,
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));

    const cart = await Cart.findOne({ userId: req.user.id });
    if (cart) {
      cart.items = [];
      cart.restaurantId = null;
      cart.couponCode = null;
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart: {
        restaurantId: null,
        restaurantName: '',
        couponCode: null,
        items: [],
        pricing: { subtotal: 0, deliveryFee: 0, packagingFee: 0, platformFee: 0, taxes: 0, discount: 0, grandTotal: 0 },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const applyCoupon = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));
    const { code } = req.body;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return next(new AppError('Cart not found', 404));

    cart.couponCode = code ? code.toUpperCase() : null;
    await cart.save();

    const calculated = await calculateCartPricing(cart);

    if (code && !calculated.couponCode) {
      // Coupon was invalid or didn't meet min order requirements
      return res.status(400).json({
        success: false,
        message: calculated.couponMessage || 'Failed to apply coupon',
        cart: calculated,
      });
    }

    res.status(200).json({
      success: true,
      message: code ? 'Coupon applied successfully' : 'Coupon removed',
      cart: calculated,
    });
  } catch (error) {
    next(error);
  }
};
