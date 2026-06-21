import mongoose from 'mongoose';
import { STATUS } from '../utils/constants.js';

const subscriptionRequestSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    requestedPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlatformPlan', required: true },
    currentPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlatformPlan' },
    status: {
      type: String,
      enum: [STATUS.PENDING, STATUS.APPROVED, STATUS.REJECTED],
      default: STATUS.PENDING,
    },
    rejectionReason: String,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
  },
  { timestamps: true }
);

subscriptionRequestSchema.index({ gymId: 1, status: 1 });

export const SubscriptionRequest = mongoose.model('SubscriptionRequest', subscriptionRequestSchema);
