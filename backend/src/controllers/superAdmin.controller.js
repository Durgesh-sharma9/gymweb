import { User } from '../models/User.js';
import { Gym } from '../models/Gym.js';
import { PlatformPlan } from '../models/PlatformPlan.js';
import { Member } from '../models/Member.js';
import { Payment } from '../models/Payment.js';
import { GymSettings } from '../models/GymSettings.js';
import { SubscriptionRequest } from '../models/SubscriptionRequest.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { ROLES, STATUS } from '../utils/constants.js';
import { generatePassword } from '../utils/generatePassword.js';
import { sendGymOwnerCredentials } from '../services/email.service.js';
import { generateRegistrationToken } from '../services/qr.service.js';
import { logActivity } from '../services/activityLog.service.js';

const slugify = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const getDashboard = catchAsync(async (req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalGyms, activeGyms, trialGyms, expiredSubscriptions,
    totalMembers, totalTrainers, totalOwners, plans,
    monthlyRevenue, totalRevenue,
    recentGyms, expiringSubscriptions,
  ] = await Promise.all([
    Gym.countDocuments(),
    Gym.countDocuments({ status: STATUS.ACTIVE }),
    Gym.countDocuments({ isTrial: true, trialEnd: { $gte: now } }),
    Gym.countDocuments({ subscriptionStatus: 'expired' }),
    Member.countDocuments({ status: { $ne: 'inactive' } }),
    User.countDocuments({ role: ROLES.TRAINER, status: STATUS.ACTIVE }),
    User.countDocuments({ role: ROLES.GYM_OWNER }),
    PlatformPlan.countDocuments({ status: STATUS.ACTIVE }),
    Payment.aggregate([
      { $match: { paymentDate: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$paidAmount' } } },
    ]),
    Payment.aggregate([{ $match: {} }, { $group: { _id: null, total: { $sum: '$paidAmount' } } }]),
    Gym.find().populate('ownerId', 'name').populate('platformPlanId', 'name').sort({ createdAt: -1 }).limit(10),
    Gym.find({
      subscriptionStatus: 'active',
      subscriptionEnd: { $gte: now, $lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) },
    }).populate('ownerId', 'name').populate('platformPlanId', 'name').sort({ subscriptionEnd: 1 }).limit(10),
  ]);

  res.json(
    new ApiResponse(200, {
      totalGyms,
      activeGyms,
      trialGyms,
      expiredSubscriptions,
      totalMembers,
      totalTrainers,
      totalOwners,
      activePlans: plans,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentGyms,
      expiringSubscriptions,
    })
  );
});

export const getGymOwners = catchAsync(async (req, res) => {
  const owners = await User.find({ role: ROLES.GYM_OWNER })
    .select('-password')
    .populate('gymId', 'name status subscriptionStatus');
  res.json(new ApiResponse(200, owners));
});

export const createGymOwner = catchAsync(async (req, res) => {
  const { name, email, mobile, gymName, platformPlanId, address, city } = req.body;

  if (!name || !email || !gymName) throw new ApiError(400, 'Name, email, and gym name required');

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, 'Email already registered');

  const password = generatePassword();
  let slug = slugify(gymName);
  const slugExists = await Gym.findOne({ slug });
  if (slugExists) slug = `${slug}-${Date.now()}`;

  const owner = await User.create({
    name,
    email: email.toLowerCase(),
    mobile,
    password,
    role: ROLES.GYM_OWNER,
    createdBy: req.user._id,
  });

  const gym = await Gym.create({
    name: gymName,
    slug,
    address,
    city,
    mobile,
    email: email.toLowerCase(),
    ownerId: owner._id,
    platformPlanId: platformPlanId || null,
    subscriptionStart: new Date(),
    subscriptionStatus: 'active',
  });

  owner.gymId = gym._id;
  await owner.save();

  await GymSettings.create({
    gymId: gym._id,
    registrationToken: generateRegistrationToken(),
  });

  await sendGymOwnerCredentials({ email, name, password, gymName });

  await logActivity({
    action: 'gym_owner_created',
    entityType: 'user',
    entityId: owner._id,
    description: `Gym owner ${name} and gym ${gymName} created`,
    performedBy: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, { owner, gym }, 'Gym owner created'));
});

export const updateGymOwner = catchAsync(async (req, res) => {
  const owner = await User.findOne({ _id: req.params.id, role: ROLES.GYM_OWNER });
  if (!owner) throw new ApiError(404, 'Gym owner not found');

  const { name, mobile, status } = req.body;
  if (name) owner.name = name;
  if (mobile) owner.mobile = mobile;
  if (status) owner.status = status;
  await owner.save();

  res.json(new ApiResponse(200, owner, 'Gym owner updated'));
});

export const getGyms = catchAsync(async (req, res) => {
  const gyms = await Gym.find()
    .populate('ownerId', 'name email mobile status')
    .populate('platformPlanId', 'name price maxMembers maxTrainers')
    .sort({ createdAt: -1 });

  const gymsWithCounts = await Promise.all(
    gyms.map(async (gym) => {
      const memberCount = await Member.countDocuments({ gymId: gym._id, status: { $ne: 'inactive' } });
      const trainerCount = await User.countDocuments({ gymId: gym._id, role: ROLES.TRAINER, status: STATUS.ACTIVE });
      return {
        ...gym.toObject(),
        memberCount,
        trainerCount,
      };
    })
  );

  res.json(new ApiResponse(200, gymsWithCounts));
});

export const updateGymStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const gym = await Gym.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!gym) throw new ApiError(404, 'Gym not found');
  res.json(new ApiResponse(200, gym, `Gym ${status === 'active' ? 'activated' : 'deactivated'}`));
});

export const getGymDetails = catchAsync(async (req, res) => {
  const gym = await Gym.findById(req.params.id)
    .populate('ownerId', 'name email mobile status')
    .populate('platformPlanId', 'name price maxMembers maxTrainers features');

  if (!gym) throw new ApiError(404, 'Gym not found');

  const [memberCount, trainerCount, activeMembers, expiredMembers] = await Promise.all([
    Member.countDocuments({ gymId: gym._id, status: { $ne: 'inactive' } }),
    User.countDocuments({ gymId: gym._id, role: ROLES.TRAINER, status: STATUS.ACTIVE }),
    Member.countDocuments({ gymId: gym._id, status: 'active' }),
    Member.countDocuments({ gymId: gym._id, status: 'expired' }),
  ]);

  res.json(new ApiResponse(200, {
    gym,
    stats: { memberCount, trainerCount, activeMembers, expiredMembers },
  }));
});

export const getPlatformPlans = catchAsync(async (req, res) => {
  const plans = await PlatformPlan.find().sort({ price: 1 });
  res.json(new ApiResponse(200, plans));
});

export const createPlatformPlan = catchAsync(async (req, res) => {
  const plan = await PlatformPlan.create(req.body);
  res.status(201).json(new ApiResponse(201, plan, 'Plan created'));
});

export const updatePlatformPlan = catchAsync(async (req, res) => {
  const plan = await PlatformPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!plan) throw new ApiError(404, 'Plan not found');
  res.json(new ApiResponse(200, plan, 'Plan updated'));
});

export const getAnalytics = catchAsync(async (req, res) => {
  const gymsByMonth = await Gym.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const membersByGym = await Member.aggregate([
    { $match: { status: { $ne: 'inactive' } } },
    { $group: { _id: '$gymId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  res.json(new ApiResponse(200, { gymsByMonth, membersByGym }));
});

export const getSubscriptionRequests = catchAsync(async (req, res) => {
  const requests = await SubscriptionRequest.find()
    .populate('gymId', 'name')
    .populate('requestedPlanId', 'name price')
    .populate('currentPlanId', 'name')
    .sort({ createdAt: -1 });
  res.json(new ApiResponse(200, requests));
});

export const approveSubscriptionRequest = catchAsync(async (req, res) => {
  const request = await SubscriptionRequest.findById(req.params.id);
  if (!request || request.status !== STATUS.PENDING) {
    throw new ApiError(404, 'Request not found or already processed');
  }

  const gym = await Gym.findById(request.gymId);
  if (!gym) throw new ApiError(404, 'Gym not found');

  const plan = await PlatformPlan.findById(request.requestedPlanId);
  if (!plan) throw new ApiError(404, 'Plan not found');

  gym.platformPlanId = plan._id;
  gym.subscriptionStatus = 'active';
  gym.subscriptionStart = new Date();
  gym.subscriptionEnd = new Date(Date.now() + plan.durationMonths * 30 * 24 * 60 * 60 * 1000);
  await gym.save();

  request.status = STATUS.APPROVED;
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  await request.save();

  await logActivity({
    gymId: gym._id,
    action: 'subscription_approved',
    entityType: 'subscription',
    entityId: request._id,
    description: `Subscription upgraded to ${plan.name}`,
    performedBy: req.user._id,
  });

  res.json(new ApiResponse(200, { gym, request }, 'Subscription approved'));
});

export const rejectSubscriptionRequest = catchAsync(async (req, res) => {
  const { reason } = req.body;
  const request = await SubscriptionRequest.findById(req.params.id);
  if (!request || request.status !== STATUS.PENDING) {
    throw new ApiError(404, 'Request not found or already processed');
  }

  request.status = STATUS.REJECTED;
  request.rejectionReason = reason;
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  await request.save();

  res.json(new ApiResponse(200, request, 'Subscription request rejected'));
});

export const getRevenue = catchAsync(async (req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalRevenue, monthlyRevenue, activeSubscriptions, expiredSubscriptions,
    planWiseRevenue,
  ] = await Promise.all([
    Payment.aggregate([{ $match: {} }, { $group: { _id: null, total: { $sum: '$paidAmount' } } }]),
    Payment.aggregate([
      { $match: { paymentDate: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$paidAmount' } } },
    ]),
    Gym.countDocuments({ subscriptionStatus: 'active' }),
    Gym.countDocuments({ subscriptionStatus: 'expired' }),
    Gym.aggregate([
      {
        $lookup: { from: 'platformplans', localField: 'platformPlanId', foreignField: '_id', as: 'plan' },
      },
      { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$plan.name',
          count: { $sum: 1 },
          revenue: { $sum: '$plan.price' },
        },
      },
    ]),
  ]);

  const recentPayments = await Payment.find()
    .populate('gymId', 'name')
    .sort({ paymentDate: -1 })
    .limit(50);

  res.json(new ApiResponse(200, {
    totalRevenue: totalRevenue[0]?.total || 0,
    monthlyRevenue: monthlyRevenue[0]?.total || 0,
    activeSubscriptions,
    expiredSubscriptions,
    planWiseRevenue,
    recentPayments,
  }));
});
