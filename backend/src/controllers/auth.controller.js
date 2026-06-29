import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Gym } from '../models/Gym.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { ROLES, STATUS } from '../utils/constants.js';

const signToken = (userId) =>
  jwt.sign({ userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  role: user.role,
  gymId: user.gymId,
  permissions: user.permissions,
  status: user.status,
  mustChangePassword: user.mustChangePassword,
  emailVerified: user.emailVerified,
  hasCompletedOnboarding: user.hasCompletedOnboarding,
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Email and password required');

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid credentials');

  if (user.status === STATUS.INACTIVE) throw new ApiError(403, 'Account is inactive');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid credentials');

  if (user.role !== ROLES.SUPER_ADMIN && user.gymId) {
    const gym = await Gym.findById(user.gymId);
    if (!gym || gym.status === STATUS.INACTIVE) {
      throw new ApiError(403, 'Gym is inactive');
    }
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken(user._id);
  res.json(new ApiResponse(200, { token, user: sanitizeUser(user) }, 'Login successful'));
});

export const getMe = catchAsync(async (req, res) => {
  // Reload user from database to get fresh data
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, 'User not found');

  let gym = null;
  if (user.gymId) {
    gym = await Gym.findById(user.gymId).select('name slug logo status trialStart trialEnd isTrial');
    
    if (gym && gym.isTrial && gym.trialEnd) {
      const now = new Date();
      const trialEnd = new Date(gym.trialEnd);
      const daysRemaining = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
      gym = gym.toObject();
      gym.trialDaysRemaining = Math.max(0, daysRemaining);
    }
  }
  res.json(new ApiResponse(200, { user: sanitizeUser(user), gym }));
});

export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters');
  }

  // Reload user from database to get fresh mustChangePassword flag
  const user = await User.findById(req.user._id).select('+password');

  // Only require current password if not forced to change
  if (!user.mustChangePassword) {
    if (!currentPassword) throw new ApiError(400, 'Current password required');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new ApiError(401, 'Current password is incorrect');
  }

  user.password = newPassword;
  user.mustChangePassword = false;
  await user.save();

  res.json(new ApiResponse(200, null, 'Password changed successfully'));
});
