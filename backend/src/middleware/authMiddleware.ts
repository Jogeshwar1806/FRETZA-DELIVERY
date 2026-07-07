import { Response, NextFunction, Request } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { User, IUser } from '../models/userModel.js';
import { AppError } from './errorMiddleware.js';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = '';

    // Check for Authorization Header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new AppError('Authentication failed. Access denied.', 401));
    }

    // Decode and verify
    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new AppError('Authentication failed. Invalid or expired token.', 401));
    }

    // Find User
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Authentication failed. Internal server validation error.', 401));
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('Access denied. You do not have permission for this action.', 403)
      );
    }
    next();
  };
};
