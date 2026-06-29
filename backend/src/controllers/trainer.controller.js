import { User } from '../models/User.js';
import { Member } from '../models/Member.js';
import { Membership } from '../models/Membership.js';
import { Payment } from '../models/Payment.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { ROLES, STATUS, ACTIVITY_ACTIONS, DEFAULT_TRAINER_PERMISSIONS } from '../utils/constants.js';
import { generatePassword } from '../utils/generatePassword.js';
import { sendTrainerCredentials } from '../services/email.service.js';
import { logActivity } from '../services/activityLog.service.js';
import { Gym } from '../models/Gym.js';

export const getTrainers = catchAsync(async (req, res) => {
  const trainers = await User.find({ gymId: req.gymId, role: ROLES.TRAINER })
    .select('-password')
    .sort({ createdAt: -1 });

  const withCounts = await Promise.all(
    trainers.map(async (t) => {
      const memberCount = await Member.countDocuments({ gymId: req.gymId, assignedTrainerId: t._id });
      return { ...t.toObject(), memberCount };
    })
  );

  res.json(new ApiResponse(200, withCounts));
});

export const createTrainer = catchAsync(async (req, res) => {
  const { name, email, mobile, permissions } = req.body;
  if (!name || !email) throw new ApiError(400, 'Name and email required');

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, 'Email already registered');

  const password = generatePassword();
  const trainer = await User.create({
    name,
    email: email.toLowerCase(),
    mobile,
    password,
    role: ROLES.TRAINER,
    gymId: req.gymId,
    permissions: { ...DEFAULT_TRAINER_PERMISSIONS, ...permissions },
    mustChangePassword: true,
    createdBy: req.user._id,
  });

  const gym = await Gym.findById(req.gymId);
  await sendTrainerCredentials({ email, name, password, gymName: gym.name });

  await logActivity({
    gymId: req.gymId, action: ACTIVITY_ACTIONS.TRAINER_ADDED, entityType: 'user',
    entityId: trainer._id, description: `Trainer ${name} added`, performedBy: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, trainer, 'Trainer created. Credentials sent to email.'));
});

export const updateTrainer = catchAsync(async (req, res) => {
  const trainer = await User.findOne({ _id: req.params.id, gymId: req.gymId, role: ROLES.TRAINER });
  if (!trainer) throw new ApiError(404, 'Trainer not found');

  const { name, mobile, permissions, status } = req.body;
  if (name) trainer.name = name;
  if (mobile) trainer.mobile = mobile;
  if (permissions) trainer.permissions = { ...trainer.permissions, ...permissions };
  if (status) trainer.status = status;
  await trainer.save();

  await logActivity({
    gymId: req.gymId, action: ACTIVITY_ACTIONS.TRAINER_UPDATED, entityType: 'user',
    entityId: trainer._id, description: `Trainer ${trainer.name} updated`, performedBy: req.user._id,
  });

  res.json(new ApiResponse(200, trainer, 'Trainer updated'));
});

export const getTrainerDashboard = catchAsync(async (req, res) => {
  const gymId = req.gymId;
  const trainerId = req.user._id;
  const now = new Date();
  const today = new Date(now.setHours(0, 0, 0, 0));
  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    assignedCount, activeCount, expiredCount,
    expiringThisWeek, recentMembers, recentRenewals, todayCollections,
  ] = await Promise.all([
    Member.countDocuments({ gymId, assignedTrainerId: trainerId }),
    Member.countDocuments({ gymId, assignedTrainerId: trainerId, status: 'active' }),
    Member.countDocuments({ gymId, assignedTrainerId: trainerId, status: 'expired' }),
    Membership.countDocuments({
      gymId,
      memberId: { $in: await Member.find({ gymId, assignedTrainerId: trainerId }).distinct('_id') },
      status: 'active',
      endDate: { $gte: today, $lte: weekEnd },
    }),
    Member.find({ gymId, assignedTrainerId: trainerId })
      .populate('currentMembershipId', 'planName endDate')
      .sort({ createdAt: -1 })
      .limit(5),
    Membership.find({
      gymId,
      memberId: { $in: await Member.find({ gymId, assignedTrainerId: trainerId }).distinct('_id') },
    })
      .populate('memberId', 'fullName mobile')
      .sort({ createdAt: -1 })
      .limit(5),
    req.user.permissions?.collectFees
      ? Payment.aggregate([
          { $match: { gymId, collectedBy: trainerId, paymentDate: { $gte: today } } },
          { $group: { _id: null, total: { $sum: '$paidAmount' }, count: { $sum: 1 } } },
        ])
      : Promise.resolve([{ total: 0, count: 0 }]),
  ]);

  res.json(new ApiResponse(200, {
    assignedCount,
    activeCount,
    expiredCount,
    expiringThisWeek,
    recentMembers,
    recentRenewals,
    todayCollections: todayCollections[0] || { total: 0, count: 0 },
    permissions: req.user.permissions,
  }));
});
