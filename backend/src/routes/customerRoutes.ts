import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  applyCoupon,
} from '../controllers/cartController.js';
import { getCoupons } from '../controllers/couponController.js';
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/addressController.js';
import {
  placeOrder,
  getOrderHistory,
  getOrderById,
  cancelOrder,
} from '../controllers/orderController.js';

const router = Router();

// Protect all customer routes
router.use(protect);

// --- CART ---
router.get('/cart', getCart);
router.post('/cart', addToCart);
router.put('/cart', updateQuantity);
router.delete('/cart', clearCart);
router.delete('/cart/:foodItemId', removeFromCart);
router.post('/cart/coupon', applyCoupon);

// --- COUPONS ---
router.get('/coupons', getCoupons);

// --- ADDRESSES ---
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.put('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);
router.put('/addresses/:addressId/default', setDefaultAddress);

// --- ORDERS ---
router.post('/orders', placeOrder);
router.get('/orders', getOrderHistory);
router.get('/orders/:orderId', getOrderById);
router.put('/orders/:orderId/cancel', cancelOrder);

export default router;
