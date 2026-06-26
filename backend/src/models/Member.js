import mongoose from 'mongoose';
import { MEMBER_STATUS } from '../utils/constants.js';

const memberSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    memberId: { type: String, unique: true, sparse: true },
    fullName: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    dateOfBirth: Date,
    age: Number,
    address: String,
    photo: String,
    emergencyContactName: String,
    emergencyContactMobile: String,
    notes: String,
    status: {
      type: String,
      enum: Object.values(MEMBER_STATUS),
      default: MEMBER_STATUS.ACTIVE,
    },
    currentMembershipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Membership' },
    assignedTrainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

memberSchema.index({ gymId: 1, memberId: 1 }, { unique: true, sparse: true });
memberSchema.index({ gymId: 1, status: 1 });
memberSchema.index({ gymId: 1, assignedTrainerId: 1 });
memberSchema.index(
  { gymId: 1, mobile: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $ne: 'inactive' } },
  }
);

export const Member = mongoose.model('Member', memberSchema);
