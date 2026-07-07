import { Request, Response, NextFunction } from 'express';
import bcryptjs from 'bcryptjs';
import { User } from '../models/userModel.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phone, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ phone });
    if (userExists) {
      return next(new AppError('A user with this phone number already exists', 400));
    }

    if (email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return next(new AppError('A user with this email address already exists', 400));
      }
    }

    // Hash Password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create User
    const user = await User.create({
      name,
      phone,
      email: email || undefined,
      password: hashedPassword,
      role: role || 'Customer',
    });

    const token = signToken({ id: user.id, role: user.role });

    // Set HTTP-Only Cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, password } = req.body;

    // Find User
    const user = await User.findOne({ phone });
    if (!user) {
      return next(new AppError('Invalid credentials. User not found.', 401));
    }

    // Compare Password
    const isMatch = await bcryptjs.compare(password, user.password || '');
    if (!isMatch) {
      return next(new AppError('Invalid credentials. Password incorrect.', 401));
    }

    const token = signToken({ id: user.id, role: user.role });

    // Set Cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie('token');
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authorized to access profile information', 401));
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        phone: req.user.phone,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        addresses: req.user.addresses,
      },
    });
  } catch (error) {
    next(error);
  }
};
