import crypto from 'crypto';
import { User } from '../models/User.js';
import { Gym } from '../models/Gym.js';
import { EmailVerification } from '../models/EmailVerification.js';
import { MembershipPlan } from '../models/MembershipPlan.js';
import { GymSettings } from '../models/GymSettings.js';

import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

import { ROLES, STATUS } from '../utils/constants.js';

import { sendVerificationEmail } from '../services/email.service.js';

export const signup = catchAsync(async (req, res) => {
  const { gymName, ownerName, mobile, email, password, confirmPassword } = req.body;

  if (!gymName || !ownerName || !email || !password) {
    throw new ApiError(400, 'All fields are required');
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, 'Passwords do not match');
  }

  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  const existingUser = await User.findOne({
    email: email.toLowerCase(),
  });

  if (existingUser) {
    throw new ApiError(400, 'Email already registered');
  }

  const gymSlug =
    gymName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') +
    '-' +
    Date.now();

  const trialStart = new Date();
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 14);

  // Create User First
  const user = await User.create({
    name: ownerName,
    email: email.toLowerCase(),
    mobile,
    password,
    role: ROLES.GYM_OWNER,
    status: STATUS.ACTIVE,
    emailVerified: false,
    hasCompletedOnboarding: false,
  });

  // Create Gym
  const gym = await Gym.create({
    name: gymName,
    slug: gymSlug,
    mobile,
    email,
    ownerId: user._id,
    trialStart,
    trialEnd,
    isTrial: true,
    subscriptionStatus: 'active',
    status: STATUS.ACTIVE,
  });

  // Link user with gym
  user.gymId = gym._id;
  await user.save();

  const verificationToken = crypto.randomBytes(32).toString('hex');

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  await EmailVerification.create({
    userId: user._id,
    token: verificationToken,
    expiresAt,
    verified: false,
  });

  await sendVerificationEmail({
    email: user.email,
    name: user.name,
    verificationToken,
  });

  await GymSettings.create({
    gymId: gym._id,
    currency: 'INR',
    gstEnabled: false,
    gstRate: 18,
    receiptTemplate: 'professional_white',
  });

  await MembershipPlan.create([
    {
      gymId: gym._id,
      name: 'Monthly',
      duration: 30,
      price: 1000,
      status: STATUS.ACTIVE,
    },
    {
      gymId: gym._id,
      name: 'Quarterly',
      duration: 90,
      price: 2700,
      status: STATUS.ACTIVE,
    },
    {
      gymId: gym._id,
      name: 'Yearly',
      duration: 365,
      price: 10000,
      status: STATUS.ACTIVE,
    },
  ]);

  res.json(
    new ApiResponse(
      201,
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
        },
        gym: {
          _id: gym._id,
          name: gym.name,
          slug: gym.slug,
          trialEnd: gym.trialEnd,
        },
      },
      'Account created successfully. Please check your email for verification.'
    )
  );
});

export const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.params;

  const verification = await EmailVerification.findOne({ token });
  if (!verification) {
    throw new ApiError(400, 'Invalid verification link');
  }

  if (verification.verified) {
    throw new ApiError(400, 'Email already verified');
  }

  if (verification.expiresAt < new Date()) {
    throw new ApiError(400, 'Verification link expired');
  }

  await User.findByIdAndUpdate(verification.userId, { emailVerified: true });
  verification.verified = true;
  await verification.save();

  res.json(new ApiResponse(200, null, 'Email verified successfully'));
});

export const resendVerification = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.emailVerified) {
    throw new ApiError(400, 'Email already verified');
  }

  await EmailVerification.deleteMany({ userId: user._id });

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  await EmailVerification.create({
    userId: user._id,
    token: verificationToken,
    expiresAt,
    verified: false,
  });

  await sendVerificationEmail({
    email: user.email,
    name: user.name,
    verificationToken,
  });

  res.json(new ApiResponse(200, null, 'Verification email sent'));
});
