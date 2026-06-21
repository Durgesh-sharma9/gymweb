import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, STATUS, DEFAULT_TRAINER_PERMISSIONS } from '../utils/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, trim: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
    },
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', default: null },
    permissions: {
      addMember: { type: Boolean, default: DEFAULT_TRAINER_PERMISSIONS.addMember },
      renewMembership: { type: Boolean, default: DEFAULT_TRAINER_PERMISSIONS.renewMembership },
      viewAssignedMembers: { type: Boolean, default: DEFAULT_TRAINER_PERMISSIONS.viewAssignedMembers },
      collectFees: { type: Boolean, default: DEFAULT_TRAINER_PERMISSIONS.collectFees },
    },
    status: { type: String, enum: [STATUS.ACTIVE, STATUS.INACTIVE], default: STATUS.ACTIVE },
    mustChangePassword: { type: Boolean, default: false },
    lastLoginAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    emailVerified: { type: Boolean, default: false },
    hasCompletedOnboarding: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.index({ gymId: 1, role: 1, status: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model('User', userSchema);
