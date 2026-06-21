import mongoose from 'mongoose';
import { STATUS } from '../utils/constants.js';

const gymSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true },
    logo: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    mobile: String,
    email: String,
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    platformPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlatformPlan' },
    subscriptionStart: Date,
    subscriptionEnd: Date,
    subscriptionStatus: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
    },
    trialStart: Date,
    trialEnd: Date,
    isTrial: { type: Boolean, default: false },
    status: { type: String, enum: [STATUS.ACTIVE, STATUS.INACTIVE], default: STATUS.ACTIVE },
  },
  { timestamps: true }
);

gymSchema.index({ ownerId: 1 });
gymSchema.index({ status: 1 });

export const Gym = mongoose.model('Gym', gymSchema);
