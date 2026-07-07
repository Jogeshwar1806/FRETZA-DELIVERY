import { Response, NextFunction } from 'express';
import { User } from '../models/userModel.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const getAddresses = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, addresses: user?.addresses || [] });
  } catch (error) {
    next(error);
  }
};

export const addAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));
    const { label, houseNumber, street, village, landmark, pincode, district, state, lat, lng, isDefault } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return next(new AppError('User not found', 404));

    // If setting default, reset others
    if (isDefault) {
      user.addresses.forEach((a) => {
        a.isDefault = false;
      });
    }

    const newAddr: any = {
      label,
      houseNumber,
      street,
      village,
      landmark,
      pincode,
      district,
      state,
      lat: lat || undefined,
      lng: lng || undefined,
      isDefault: isDefault || user.addresses.length === 0, // Make default if first address
    };

    user.addresses.push(newAddr);
    await user.save(); // Save triggers the pre-save hook to concatenate details!

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));
    const { addressId } = req.params;
    const updates = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return next(new AppError('User not found', 404));

    const address = user.addresses.find((a) => a._id?.toString() === addressId);
    if (!address) return next(new AppError('Address not found', 404));

    if (updates.isDefault) {
      user.addresses.forEach((a) => {
        a.isDefault = false;
      });
    }

    Object.assign(address, updates);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));
    const { addressId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) return next(new AppError('User not found', 404));

    // Remove the address using standard JS filter
    user.addresses = user.addresses.filter((a) => a._id?.toString() !== addressId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

export const setDefaultAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));
    const { addressId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) return next(new AppError('User not found', 404));

    user.addresses.forEach((a) => {
      a.isDefault = a._id?.toString() === addressId;
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Default address updated',
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};
