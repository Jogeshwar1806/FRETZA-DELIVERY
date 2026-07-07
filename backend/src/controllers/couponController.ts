import { Request, Response, NextFunction } from 'express';
import { Coupon } from '../models/couponModel.js';

export const getCoupons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupons = await Coupon.find({ status: 'Active', expiry: { $gt: new Date() } });
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};
