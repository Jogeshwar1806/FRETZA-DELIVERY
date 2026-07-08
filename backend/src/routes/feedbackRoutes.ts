import { Router } from 'express';
import { protect, restrictTo, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { Feedback } from '../models/feedbackModel.js';
import { AppError } from '../middleware/errorMiddleware.js';

const router = Router();

// Protect all feedback routes (require login)
router.use(protect);

// POST /api/feedback (Submit feedback)
router.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { feedbackType, message } = req.body;
    if (!feedbackType || !message) {
      return next(new AppError('Please provide feedback type and message', 400));
    }

    const feedback = await Feedback.create({
      name: req.user!.name,
      phone: req.user!.phone,
      email: req.user!.email || '',
      role: req.user!.role,
      feedbackType,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! It has been recorded.',
      feedback,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/feedback (Admin fetch all feedbacks)
router.get('/', restrictTo('Admin'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: feedbacks.length,
      feedbacks,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
