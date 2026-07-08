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

    const normalizedRole = (role || 'customer').toLowerCase();
    if (normalizedRole === 'admin') {
      return next(new AppError('Unauthorized: Registration for Admin is not permitted.', 403));
    }

    // Hash Password
    const hashedPassword = await bcryptjs.hash(password, 10);

    let deliveryProfile = {};
    let merchantProfile = {};

    if (normalizedRole === 'driver') {
      const { vehicleType, vehicleNumber, drivingLicenseNumber, aadhaarNumber } = req.body;
      deliveryProfile = {
        vehicleType: vehicleType || '',
        vehicleNumber: vehicleNumber || '',
        drivingLicenseNumber: drivingLicenseNumber || '',
        aadhaarNumber: aadhaarNumber || '',
        isVerified: false,
        isOnline: false,
      };
    } else if (normalizedRole === 'restaurant_owner') {
      const { restaurantName, gstNumber, fssaiLicense, panNumber, bankDetails } = req.body;
      merchantProfile = {
        restaurantName: restaurantName || '',
        gstNumber: gstNumber || '',
        fssaiLicense: fssaiLicense || '',
        panNumber: panNumber || '',
        verificationStatus: 'Pending',
        bankDetails: bankDetails || {
          accountNumber: '',
          ifscCode: '',
          bankName: '',
          accountHolderName: '',
        },
      };
    }

    // Create User
    const user = await User.create({
      name,
      phone,
      email: email || undefined,
      password: hashedPassword,
      role: normalizedRole,
      deliveryProfile,
      merchantProfile,
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
    const { phone, password, role } = req.body;
    const normalizedRole = (role || '').toLowerCase();

    // Admin backend credentials check bypass
    if (phone === '7978253881') {
      if (password !== 'Jogeswastik@1') {
        return next(new AppError('Invalid credentials. Password incorrect.', 401));
      }
      
      let adminUser = await User.findOne({ phone: '7978253881' });
      if (!adminUser) {
        const hashedAdminPassword = await bcryptjs.hash('Jogeswastik@1', 10);
        adminUser = await User.create({
          name: 'Fretza Admin',
          phone: '7978253881',
          email: 'admin@fretza.com',
          password: hashedAdminPassword,
          role: 'admin',
        });
      }
      
      const token = signToken({ id: adminUser.id, role: 'admin' });
      
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        message: 'Admin login successful',
        token,
        user: {
          id: adminUser.id,
          name: adminUser.name,
          phone: adminUser.phone,
          email: adminUser.email,
          role: 'admin',
          avatar: adminUser.avatar,
          addresses: adminUser.addresses,
        },
      });
    }

    // Find User
    const user = await User.findOne({ phone });
    if (!user) {
      return next(new AppError('Invalid credentials. User not found.', 401));
    }

    // Validate role match
    const dbRole = user.role.toLowerCase();
    if (normalizedRole) {
      const mappedRole = normalizedRole === 'driver' ? 'delivery partner' : normalizedRole === 'restaurant_owner' ? 'restaurant owner' : normalizedRole;
      if (dbRole !== normalizedRole && dbRole !== mappedRole) {
        return next(new AppError(`User is not registered as a ${role}.`, 401));
      }
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
