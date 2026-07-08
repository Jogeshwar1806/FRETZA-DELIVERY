import { Router } from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
  getPlatformStats,
  getPlatformUsers,
  updateUserRole,
  getPlatformRestaurants,
  updateMerchantApproval,
  getPlatformOrders,
  getPricingSettings,
  updatePricingEngine,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getTickets,
  replyTicket,
  getAuditLogs,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/adminController.js';

const router = Router();

// Secure all admin routes
router.use(protect);
router.use(restrictTo('Admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getPlatformUsers);
router.put('/users/:userId', updateUserRole);
router.get('/restaurants', getPlatformRestaurants);
router.put('/restaurants/:restaurantId', updateMerchantApproval);
router.get('/orders', getPlatformOrders);
router.get('/settings', getPricingSettings);
router.put('/settings', updatePricingEngine);
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:couponId', updateCoupon);
router.delete('/coupons/:couponId', deleteCoupon);
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:categoryId', updateCategory);
router.delete('/categories/:categoryId', deleteCategory);
router.get('/tickets', getTickets);
router.post('/tickets/:ticketId/reply', replyTicket);
router.get('/audit', getAuditLogs);

export default router;
