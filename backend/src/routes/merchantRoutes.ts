import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
  getRestaurantProfile,
  updateRestaurantProfile,
  createRestaurantProfile,
  getMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getOrders,
  updateOrderStatus,
  getAnalytics,
} from '../controllers/merchantController.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = process.env.VERCEL ? path.join(os.tmpdir(), 'fretza-uploads') : path.join(__dirname, '../../public/uploads');

// Ensure upload directory exists safely
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (error) {
  console.warn('Serverless filesystem warning: Could not create upload directory. Image uploads may fail.', error);
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/\s+/g, '-');
    cb(null, `${basename}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Images only! (jpeg, jpg, png, webp)'));
  },
});

// Protect all routes to only restaurant owners
router.use(protect);
router.use(restrictTo('Restaurant Owner'));

// --- PROFILE ---
router.get('/profile', getRestaurantProfile);
router.put('/profile', updateRestaurantProfile);
router.post('/profile', createRestaurantProfile);

// --- MENU CRUD ---
router.get('/menu', getMenu);
router.post('/menu', addMenuItem);
router.put('/menu/:itemId', updateMenuItem);
router.delete('/menu/:itemId', deleteMenuItem);

// --- CATEGORIES ---
router.get('/categories', getCategories);
router.post('/categories', addCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// --- ORDERS ---
router.get('/orders', getOrders);
router.put('/orders/:orderId', updateOrderStatus);

// --- ANALYTICS ---
router.get('/analytics', getAnalytics);

// --- IMAGE UPLOAD ENGINE ---
router.post('/upload', upload.single('image'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // Construct local serving URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      url: fileUrl,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
