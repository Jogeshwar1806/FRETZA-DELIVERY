import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createPaymentOrder, verifyPaymentSignature } from '../controllers/paymentController.js';

const router = Router();

// Secure all payment routes
router.use(protect);

router.post('/order', createPaymentOrder);
router.post('/verify', verifyPaymentSignature);

export default router;
