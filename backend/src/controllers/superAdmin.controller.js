import { User } from '../models/User.js';
import { Gym } from '../models/Gym.js';
import { PlatformPlan } from '../models/PlatformPlan.js';
import { Member } from '../models/Member.js';
import { Payment } from '../models/Payment.js';
import { GymSettings } from '../models/GymSettings.js';
import { SubscriptionRequest } from '../models/SubscriptionRequest.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { ROLES, STATUS } from '../utils/constants.js';
import { generatePassword } from '../utils/generatePassword.js';
import { sendGymOwnerCredentials } from '../services/email.service.js';
import { generateRegistrationToken } from '../services/qr.service.js';
import { logActivity } from '../services/activityLog.service.js';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const slugify = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const getDashboard = catchAsync(async (req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalGyms, activeGyms, trialGyms, expiredSubscriptions,
    totalMembers, totalTrainers, totalOwners, plans,
    monthlySaaSRevenue, totalSaaSRevenue,
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
    Gym.aggregate([
      { $match: { subscriptionStatus: 'active', subscriptionStart: { $gte: monthStart } } },
      { $lookup: { from: 'platformplans', localField: 'platformPlanId', foreignField: '_id', as: 'plan' } },
      { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$plan.price', 0] } } } },
    ]),
    Gym.aggregate([
      { $match: { subscriptionStatus: 'active' } },
      { $lookup: { from: 'platformplans', localField: 'platformPlanId', foreignField: '_id', as: 'plan' } },
      { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$plan.price', 0] } } } },
    ]),
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
      monthlySaaSRevenue: monthlySaaSRevenue[0]?.total || 0,
      totalSaaSRevenue: totalSaaSRevenue[0]?.total || 0,
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

export const getGymMembers = catchAsync(async (req, res) => {
  const { gymId } = req.params;
  console.log('getGymMembers - Requested gymId:', gymId);

  const members = await Member.find({ gymId, status: { $ne: 'inactive' } })
    .populate('currentMembershipId', 'planName startDate endDate amount discount')
    .populate('assignedTrainerId', 'name')
    .sort({ createdAt: -1 });

  console.log('getGymMembers - Found members:', members.length);

  res.json(new ApiResponse(200, members));
});

export const getGymTrainers = catchAsync(async (req, res) => {
  const { gymId } = req.params;
  const trainers = await User.find({ gymId, role: ROLES.TRAINER })
    .select('-password')
    .sort({ createdAt: -1 });
  res.json(new ApiResponse(200, trainers));
});

export const getGymDetails = catchAsync(async (req, res) => {
  const gymId = req.params.id || req.gymId;

  if (!gymId) {
    return res.json(new ApiResponse(200, { gym: null, stats: null, activityLogs: null }));
  }

  console.log('Requested Gym ID:', gymId);

  const gym = await Gym.findById(gymId)
    .populate('ownerId', 'name email mobile status')
    .populate('platformPlanId', 'name price maxMembers maxTrainers features');

  console.log('Gym Found:', gym);

  if (!gym) throw new ApiError(404, 'Gym not found');

  const [memberCount, trainerCount, activeMembers, expiredMembers, activityLogs] = await Promise.all([
    Member.countDocuments({ gymId: gym._id, status: { $ne: 'inactive' } }),
    User.countDocuments({ gymId: gym._id, role: ROLES.TRAINER, status: STATUS.ACTIVE }),
    Member.countDocuments({ gymId: gym._id, status: 'active' }),
    Member.countDocuments({ gymId: gym._id, status: 'expired' }),
    ActivityLog.find({ gymId: gym._id })
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(50),
  ]);

  res.json(new ApiResponse(200, {
    gym,
    stats: { memberCount, trainerCount, activeMembers, expiredMembers },
    activityLogs,
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

export const createSubscriptionRequest = catchAsync(async (req, res) => {
  const { requestedPlanId } = req.body;
  const gymId = req.gymId;

  if (!requestedPlanId) {
    throw new ApiError(400, 'Requested plan ID is required');
  }

  const gym = await Gym.findById(gymId);
  if (!gym) throw new ApiError(404, 'Gym not found');

  const plan = await PlatformPlan.findById(requestedPlanId);
  if (!plan) throw new ApiError(404, 'Plan not found');

  const existingRequest = await SubscriptionRequest.findOne({
    gymId,
    status: STATUS.PENDING,
  });

  if (existingRequest) {
    throw new ApiError(400, 'You already have a pending subscription request');
  }

  const request = await SubscriptionRequest.create({
    gymId,
    requestedPlanId,
    currentPlanId: gym.platformPlanId,
    status: STATUS.PENDING,
  });

  await logActivity({
    gymId,
    action: 'subscription_requested',
    entityType: 'subscription',
    entityId: request._id,
    description: `Subscription upgrade requested to ${plan.name}`,
    performedBy: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, request, 'Subscription request submitted'));
});

export const getRevenue = catchAsync(async (req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalSaaSRevenue, monthlySaaSRevenue, activeSubscriptions, expiredSubscriptions,
    planWiseRevenue,
  ] = await Promise.all([
    Gym.aggregate([
      { $match: { subscriptionStatus: 'active' } },
      { $lookup: { from: 'platformplans', localField: 'platformPlanId', foreignField: '_id', as: 'plan' } },
      { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$plan.price', 0] } } } },
    ]),
    Gym.aggregate([
      { $match: { subscriptionStatus: 'active', subscriptionStart: { $gte: monthStart } } },
      { $lookup: { from: 'platformplans', localField: 'platformPlanId', foreignField: '_id', as: 'plan' } },
      { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$plan.price', 0] } } } },
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
          revenue: { $sum: { $ifNull: ['$plan.price', 0] } },
        },
      },
    ]),
  ]);

  res.json(new ApiResponse(200, {
    totalSaaSRevenue: totalSaaSRevenue[0]?.total || 0,
    monthlySaaSRevenue: monthlySaaSRevenue[0]?.total || 0,
    activeSubscriptions,
    expiredSubscriptions,
    planWiseRevenue,
  }));
});

export const exportGymMembers = catchAsync(async (req, res) => {
  const { gymId } = req.params;
  const { format } = req.query;

  console.log('exportGymMembers - Requested gymId:', gymId);
  console.log('exportGymMembers - Requested format:', format);

  const members = await Member.find({ gymId, status: { $ne: 'inactive' } })
    .populate('currentMembershipId', 'planName startDate endDate amount discount')
    .populate('assignedTrainerId', 'name')
    .sort({ createdAt: -1 });

  console.log('exportGymMembers - Members found:', members.length);
  console.log('exportGymMembers - typeof members:', typeof members);
  console.log('exportGymMembers - Array.isArray(members):', Array.isArray(members));

  if (!members || members.length === 0) {
    console.log('exportGymMembers - No members available');
    return res.json(new ApiResponse(200, { message: 'No members available for export' }));
  }

  const data = members.map(m => ({
    'Member ID': m.memberId || '-',
    Name: m.fullName,
    Mobile: m.mobile,
    Gender: m.gender || '-',
    'Date of Birth': m.dateOfBirth ? new Date(m.dateOfBirth).toLocaleDateString() : '-',
    Age: m.age || '-',
    Address: m.address || '-',
    'Emergency Contact Name': m.emergencyContactName || '-',
    'Emergency Contact Mobile': m.emergencyContactMobile || '-',
    'Photo URL': m.photo || '-',
    Plan: m.currentMembershipId?.planName || 'No Plan',
    'Membership Start': m.currentMembershipId?.startDate ? new Date(m.currentMembershipId.startDate).toLocaleDateString() : '-',
    'Membership End': m.currentMembershipId?.endDate ? new Date(m.currentMembershipId.endDate).toLocaleDateString() : '-',
    Discount: m.currentMembershipId?.discount || 0,
    'Amount Paid': m.currentMembershipId?.amount || 0,
    'Final Amount': m.currentMembershipId?.finalAmount || 0,
    'Assigned Trainer': m.assignedTrainerId?.name || '-',
    Status: m.status,
    Notes: m.notes || '-',
    'Created Date': new Date(m.createdAt).toLocaleDateString(),
  }));

  console.log('exportGymMembers - Data mapped length:', data.length);
  console.log('exportGymMembers - Sample data:', data[0]);

  if (format === 'xlsx') {
    console.log('exportGymMembers - Generating XLSX');
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    console.log('exportGymMembers - Buffer length:', buffer.length);
    console.log('exportGymMembers - Buffer type:', typeof buffer);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=gym_members_${gymId}.xlsx`);
    return res.send(buffer);
  }

  if (format === 'pdf') {
    console.log('exportGymMembers - Generating PDF');
    const doc = new jsPDF();
    doc.text('Gym Members', 14, 15);
    autoTable(doc, {
      head: [['Member ID', 'Name', 'Mobile', 'Gender', 'DOB', 'Age', 'Address', 'Emergency Contact', 'Emergency Mobile', 'Plan', 'Membership Start', 'Membership End', 'Discount', 'Amount Paid', 'Final Amount', 'Trainer', 'Status', 'Notes', 'Created Date']],
      body: data.map(row => Object.values(row)),
      startY: 20,
    });
    const buffer = Buffer.from(doc.output('arraybuffer'));
    console.log('exportGymMembers - PDF Buffer length:', buffer.length);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=gym_members_${gymId}.pdf`);
    return res.send(buffer);
  }

  res.setHeader('Content-Type', 'application/json');
  res.json(new ApiResponse(200, data));
});

export const exportGymTrainers = catchAsync(async (req, res) => {
  const { gymId } = req.params;
  const { format } = req.query;

  const trainers = await User.find({ gymId, role: ROLES.TRAINER })
    .select('-password')
    .sort({ createdAt: -1 });

  if (!trainers || trainers.length === 0) {
    return res.json(new ApiResponse(200, { message: 'No trainers available for export' }));
  }

  const data = trainers.map(t => ({
    Name: t.name,
    Mobile: t.mobile || '-',
    Email: t.email,
    Specialization: '-',
    Salary: '-',
    Status: t.status,
    'Joining Date': new Date(t.createdAt).toLocaleDateString(),
  }));

  if (format === 'xlsx') {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Trainers');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=gym_trainers_${gymId}.xlsx`);
    return res.send(buffer);
  }

  if (format === 'pdf') {
    const doc = new jsPDF();
    doc.text('Gym Trainers', 14, 15);
    autoTable(doc, {
      head: [['Name', 'Mobile', 'Email', 'Specialization', 'Salary', 'Status', 'Joining Date']],
      body: data.map(row => Object.values(row)),
      startY: 20,
    });
    const buffer = Buffer.from(doc.output('arraybuffer'));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=gym_trainers_${gymId}.pdf`);
    return res.send(buffer);
  }

  res.setHeader('Content-Type', 'application/json');
  res.json(new ApiResponse(200, data));
});

export const exportGymOwner = catchAsync(async (req, res) => {
  const { gymId } = req.params;
  const { format } = req.query;

  const gym = await Gym.findById(gymId).populate('ownerId', 'name email mobile').populate('platformPlanId', 'name');

  if (!gym) throw new ApiError(404, 'Gym not found');

  const data = [{
    'Gym Name': gym.name,
    'Owner Name': gym.ownerId?.name || '-',
    Email: gym.ownerId?.email || '-',
    Mobile: gym.ownerId?.mobile || '-',
    Plan: gym.platformPlanId?.name || 'No Plan',
    'Subscription Start': gym.subscriptionStart ? new Date(gym.subscriptionStart).toLocaleDateString() : '-',
    'Subscription End': gym.subscriptionEnd ? new Date(gym.subscriptionEnd).toLocaleDateString() : '-',
  }];

  if (format === 'xlsx') {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Owner');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=gym_owner_${gymId}.xlsx`);
    return res.send(buffer);
  }

  if (format === 'pdf') {
    const doc = new jsPDF();
    doc.text('Gym Owner Details', 14, 15);
    autoTable(doc, {
      head: [['Gym Name', 'Owner Name', 'Email', 'Mobile', 'Plan', 'Subscription Start', 'Subscription End']],
      body: data.map(row => Object.values(row)),
      startY: 20,
    });
    const buffer = Buffer.from(doc.output('arraybuffer'));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=gym_owner_${gymId}.pdf`);
    return res.send(buffer);
  }

  res.setHeader('Content-Type', 'application/json');
  res.json(new ApiResponse(200, data[0]));
});

export const exportGymSummary = catchAsync(async (req, res) => {
  const { gymId } = req.params;

  const gym = await Gym.findById(gymId).populate('ownerId', 'name email mobile').populate('platformPlanId', 'name price maxMembers maxTrainers');

  if (!gym) throw new ApiError(404, 'Gym not found');

  const [memberCount, trainerCount] = await Promise.all([
    Member.countDocuments({ gymId, status: { $ne: 'inactive' } }),
    User.countDocuments({ gymId, role: ROLES.TRAINER, status: STATUS.ACTIVE }),
  ]);

  const data = {
    'Gym Name': gym.name,
    'Gym City': gym.city,
    'Gym Address': gym.address,
    'Owner Name': gym.ownerId?.name,
    'Owner Email': gym.ownerId?.email,
    'Owner Mobile': gym.ownerId?.mobile || '-',
    'Members Count': memberCount,
    'Trainers Count': trainerCount,
    'Current Plan': gym.platformPlanId?.name || 'No Plan',
    'Plan Price': gym.platformPlanId ? `₹${gym.platformPlanId.price}/mo` : '-',
    'Max Members': gym.platformPlanId?.maxMembers ?? 'Unlimited',
    'Max Trainers': gym.platformPlanId?.maxTrainers ?? 'Unlimited',
    'Subscription Status': gym.subscriptionStatus,
    'Subscription Start': gym.subscriptionStart ? new Date(gym.subscriptionStart).toLocaleDateString() : '-',
    'Subscription End': gym.subscriptionEnd ? new Date(gym.subscriptionEnd).toLocaleDateString() : '-',
    'Gym Status': gym.status,
  };

  res.json(new ApiResponse(200, data));
});

export const getGymLimits = catchAsync(async (req, res) => {
  const gymId = req.gymId;

  const gym = await Gym.findById(gymId).populate('platformPlanId', 'maxMembers maxTrainers');

  if (!gym) throw new ApiError(404, 'Gym not found');

  const [currentMembers, currentTrainers] = await Promise.all([
    Member.countDocuments({ gymId, status: { $ne: 'inactive' } }),
    User.countDocuments({ gymId, role: ROLES.TRAINER, status: STATUS.ACTIVE }),
  ]);

  const maxMembers = gym.platformPlanId?.maxMembers;
  const maxTrainers = gym.platformPlanId?.maxTrainers;

  const canAddMember = maxMembers === null || currentMembers < maxMembers;
  const canAddTrainer = maxTrainers === null || currentTrainers < maxTrainers;

  res.json(new ApiResponse(200, {
    currentMembers,
    maxMembers: maxMembers ?? 'Unlimited',
    currentTrainers,
    maxTrainers: maxTrainers ?? 'Unlimited',
    canAddMember,
    canAddTrainer,
    memberLimitReached: maxMembers !== null && currentMembers >= maxMembers,
    trainerLimitReached: maxTrainers !== null && currentTrainers >= maxTrainers,
  }));
});

export const getActivePlatformPlans = catchAsync(async (req, res) => {
  const plans = await PlatformPlan.find({ status: 'active' }).sort({ price: 1 });
  res.json(new ApiResponse(200, plans));
});

export const getGymSubscriptionRequests = catchAsync(async (req, res) => {
  const gymId = req.gymId;
  const requests = await SubscriptionRequest.find({ gymId })
    .populate('requestedPlanId', 'name price')
    .populate('currentPlanId', 'name')
    .sort({ createdAt: -1 });
  res.json(new ApiResponse(200, requests));
});
