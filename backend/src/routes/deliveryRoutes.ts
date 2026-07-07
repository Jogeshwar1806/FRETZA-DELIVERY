import { Router } from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
  getDashboardStats,
  getAvailableOrders,
  acceptOrder,
  rejectOrder,
  updateDeliveryStatus,
  getDeliveryHistory,
  updateRiderProfile,
} from '../controllers/deliveryController.js';

const router = Router();

// Protect all delivery partner routes
router.use(protect);
router.use(restrictTo('Delivery Partner'));

router.get('/dashboard', getDashboardStats);
router.get('/available', getAvailableOrders);
router.post('/orders/:orderId/accept', acceptOrder);
router.post('/orders/:orderId/reject', rejectOrder);
router.post('/orders/:orderId/status', updateDeliveryStatus);
router.get('/history', getDeliveryHistory);
router.put('/profile', updateRiderProfile);

export default router;
