import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { registerValidator, loginValidator } from '../validators/authValidators.js';
import { validateRequest } from '../middleware/validateMiddleware.js';

const router = Router();

router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginValidator, validateRequest, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;
