import { AuditLog } from '../models/auditLogModel.js';
import mongoose from 'mongoose';

export const logActivity = async (
  actorId: mongoose.Types.ObjectId | string,
  actorName: string,
  action: string,
  module: string,
  details: string,
  ipAddress?: string
) => {
  try {
    await AuditLog.create({
      actorId,
      actorName,
      action,
      module,
      details,
      ipAddress,
    });
  } catch (err) {
    console.error('Audit logger failed:', err);
  }
};
