import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import merchantRoutes from './routes/merchantRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

// Load Env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect Database
connectDB();

// Global Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" } // Required for local uploads access from React frontend
  })
);
app.use(
  cors({
    origin: function (origin, callback) {
      return callback(null, true); // Allow all origins dynamically for Vercel deployment
    },
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Static Files Serving
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/merchant', merchantRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', customerRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Listen
app.listen(PORT, () => {
  console.log(`FRETZA Backend Server listening on http://localhost:${PORT}`);
});

export default app;
