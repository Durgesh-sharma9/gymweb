import { Member } from '../models/Member.js';
import { Membership } from '../models/Membership.js';
import { MembershipPlan } from '../models/MembershipPlan.js';
import { Payment } from '../models/Payment.js';
import { Expense } from '../models/Expense.js';
import { User } from '../models/User.js';
import { GymSettings } from '../models/GymSettings.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { ROLES, MEMBER_STATUS, ACTIVITY_ACTIONS } from '../utils/constants.js';
import { calculatePricing, calculateEndDate } from '../services/tax.service.js';
import { createInvoice, generateInvoicePDF } from '../services/invoice.service.js';
import { logActivity } from '../services/activityLog.service.js';
import { getExpiryReminders, syncMemberStatus } from '../services/membership.service.js';
import { Gym } from '../models/Gym.js';

const getTrainerFilter = (user) => {
  if (user.role === ROLES.TRAINER && user.permissions?.viewAssignedMembers) {
    return { assignedTrainerId: user._id };
  }
  if (user.role === ROLES.TRAINER) {
    return { assignedTrainerId: user._id };
  }
  return {};
};

export const getMembers = catchAsync(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const filter = { gymId: req.gymId, ...getTrainerFilter(req.user) };
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [members, total] = await Promise.all([
    Member.find(filter)
      .populate('assignedTrainerId', 'name')
      .populate('currentMembershipId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Member.countDocuments(filter),
  ]);

  res.json(new ApiResponse(200, { members, total, page: parseInt(page), pages: Math.ceil(total / limit) }));
});

export const checkMobile = catchAsync(async (req, res) => {
  const member = await Member.findOne({
    gymId: req.gymId,
    mobile: req.params.mobile,
    status: { $ne: MEMBER_STATUS.INACTIVE },
  }).populate('currentMembershipId');

  res.json(new ApiResponse(200, { exists: !!member, member }));
});

export const getMember = catchAsync(async (req, res) => {
  const filter = { _id: req.params.id, gymId: req.gymId, ...getTrainerFilter(req.user) };
  const member = await Member.findOne(filter)
    .populate('assignedTrainerId', 'name email')
    .populate('currentMembershipId');
  if (!member) throw new ApiError(404, 'Member not found');

  const history = await Membership.find({ gymId: req.gymId, memberId: member._id }).sort({ createdAt: -1 });
  const payments = await Payment.find({ gymId: req.gymId, memberId: member._id }).sort({ paymentDate: -1 });

  res.json(new ApiResponse(200, { member, history, payments }));
});

const generateMemberId = async (gymId) => {
  const count = await Member.countDocuments({ gymId });
  const memberId = `GYM${String(count + 1).padStart(4, '0')}`;
  return memberId;
};

export const createMemberWithMembership = catchAsync(async (req, res) => {
  const gymId = req.gymId;
  const {
    fullName, mobile, gender, dateOfBirth, address, photo,
    emergencyContactName, emergencyContactMobile, notes,
    planId, isCustomPlan, customPlan, startDate, discountType, discountValue,
    paidAmount, paymentMethod,
  } = req.body;

  if (!fullName || !mobile) throw new ApiError(400, 'Name and mobile required');

  const existing = await Member.findOne({ gymId, mobile, status: { $ne: MEMBER_STATUS.INACTIVE } });
  if (existing) {
    throw new ApiError(409, 'Member with this mobile already exists', { member: existing });
  }

  const memberId = await generateMemberId(gymId);

  const settings = await GymSettings.findOne({ gymId });
  let baseAmount, durationType, durationValue, planName;

  if (isCustomPlan) {
    baseAmount = customPlan.amount;
    durationType = customPlan.durationType;
    durationValue = customPlan.durationValue;
    planName = customPlan.name;
  } else {
    const plan = await MembershipPlan.findOne({ _id: planId, gymId, status: 'active' });
    if (!plan) throw new ApiError(404, 'Plan not found');
    baseAmount = plan.amount;
    durationType = plan.durationType;
    durationValue = plan.durationValue;
    planName = plan.name;
  }

  const pricing = calculatePricing({
    baseAmount,
    discountType: settings?.discountEnabled ? discountType : null,
    discountValue,
    taxEnabled: settings?.taxEnabled,
    taxName: settings?.taxName,
    taxPercentage: settings?.taxPercentage,
    taxMode: settings?.taxMode,
  });

  const paid = paidAmount ?? pricing.finalAmount;
  const due = Math.max(0, pricing.finalAmount - paid);

  const age = dateOfBirth ? new Date().getFullYear() - new Date(dateOfBirth).getFullYear() : null;

  const member = await Member.create({
    gymId, memberId, fullName, mobile, gender, dateOfBirth, age, address, photo,
    emergencyContactName, emergencyContactMobile, notes,
    createdBy: req.user._id, status: MEMBER_STATUS.ACTIVE,
  });

  const start = startDate ? new Date(startDate) : new Date();
  const endDate = calculateEndDate(start, durationType, durationValue);

  const membership = await Membership.create({
    gymId, memberId: member._id, planId: isCustomPlan ? null : planId,
    isCustomPlan, customPlan: isCustomPlan ? customPlan : undefined,
    startDate: start, endDate, status: MEMBER_STATUS.ACTIVE,
    baseAmount: pricing.baseAmount, discount: pricing.discount, tax: pricing.tax,
    finalAmount: pricing.finalAmount, paidAmount: paid, dueAmount: due,
    createdBy: req.user._id,
  });

  member.currentMembershipId = membership._id;
  await member.save();

  const payment = await Payment.create({
    gymId, memberId: member._id, membershipId: membership._id,
    amount: pricing.finalAmount, discountAmount: pricing.discount.amount,
    taxAmount: pricing.tax.amount, paidAmount: paid, dueAmount: due,
    paymentMethod: paymentMethod || 'cash', collectedBy: req.user._id,
  });

  const gym = await Gym.findById(gymId);
  const invoice = await createInvoice({ gym, member, membership, payment, planName, settings });

  payment.invoiceId = invoice._id;
  await payment.save();

  await logActivity({
    gymId, action: ACTIVITY_ACTIONS.MEMBER_ADDED, entityType: 'member',
    entityId: member._id, description: `Member ${fullName} added`, performedBy: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, { member, membership, payment, invoice }, 'Member created'));
});

export const updateMember = catchAsync(async (req, res) => {
  const member = await Member.findOneAndUpdate(
    { _id: req.params.id, gymId: req.gymId },
    req.body,
    { new: true }
  );
  if (!member) throw new ApiError(404, 'Member not found');

  await logActivity({
    gymId: req.gymId, action: ACTIVITY_ACTIONS.MEMBER_UPDATED, entityType: 'member',
    entityId: member._id, description: `Member ${member.fullName} updated`, performedBy: req.user._id,
  });

  res.json(new ApiResponse(200, member, 'Member updated'));
});

export const updateMemberStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const member = await Member.findOne({ _id: req.params.id, gymId: req.gymId });
  if (!member) throw new ApiError(404, 'Member not found');

  member.status = status;
  await member.save();

  if (member.currentMembershipId) {
    await Membership.findByIdAndUpdate(member.currentMembershipId, { status });
  }

  const action = status === MEMBER_STATUS.INACTIVE ? ACTIVITY_ACTIONS.MEMBER_INACTIVE : ACTIVITY_ACTIONS.MEMBER_REACTIVATED;
  await logActivity({
    gymId: req.gymId, action, entityType: 'member', entityId: member._id,
    description: `Member ${member.fullName} marked ${status}`, performedBy: req.user._id,
  });

  res.json(new ApiResponse(200, member, `Member ${status}`));
});

export const renewMembership = catchAsync(async (req, res) => {
  const member = await Member.findOne({ _id: req.params.id, gymId: req.gymId });
  if (!member) throw new ApiError(404, 'Member not found');

  const settings = await GymSettings.findOne({ gymId: req.gymId });
  const { planId, isCustomPlan, customPlan, discountType, discountValue, paidAmount, paymentMethod } = req.body;

  let baseAmount, durationType, durationValue, planName;
  if (isCustomPlan) {
    baseAmount = customPlan.amount;
    durationType = customPlan.durationType;
    durationValue = customPlan.durationValue;
    planName = customPlan.name;
  } else {
    const plan = await MembershipPlan.findOne({ _id: planId, gymId });
    if (!plan) throw new ApiError(404, 'Plan not found');
    baseAmount = plan.amount;
    durationType = plan.durationType;
    durationValue = plan.durationValue;
    planName = plan.name;
  }

  const pricing = calculatePricing({
    baseAmount,
    discountType: settings?.discountEnabled ? discountType : null,
    discountValue,
    taxEnabled: settings?.taxEnabled,
    taxName: settings?.taxName,
    taxPercentage: settings?.taxPercentage,
    taxMode: settings?.taxMode,
  });

  const paid = paidAmount ?? pricing.finalAmount;
  const due = Math.max(0, pricing.finalAmount - paid);
  const start = new Date();
  const endDate = calculateEndDate(start, durationType, durationValue);

  const membership = await Membership.create({
    gymId: req.gymId, memberId: member._id, planId: isCustomPlan ? null : planId,
    isCustomPlan, customPlan: isCustomPlan ? customPlan : undefined,
    startDate: start, endDate, status: MEMBER_STATUS.ACTIVE,
    baseAmount: pricing.baseAmount, discount: pricing.discount, tax: pricing.tax,
    finalAmount: pricing.finalAmount, paidAmount: paid, dueAmount: due,
    createdBy: req.user._id,
  });

  member.currentMembershipId = membership._id;
  member.status = MEMBER_STATUS.ACTIVE;
  await member.save();

  const payment = await Payment.create({
    gymId: req.gymId, memberId: member._id, membershipId: membership._id,
    amount: pricing.finalAmount, discountAmount: pricing.discount.amount,
    taxAmount: pricing.tax.amount, paidAmount: paid, dueAmount: due,
    paymentMethod: paymentMethod || 'cash', collectedBy: req.user._id,
  });

  const gym = await Gym.findById(req.gymId);
  const invoice = await createInvoice({ gym, member, membership, payment, planName, settings });

  await logActivity({
    gymId: req.gymId, action: ACTIVITY_ACTIONS.MEMBERSHIP_RENEWED, entityType: 'membership',
    entityId: membership._id, description: `Membership renewed for ${member.fullName}`, performedBy: req.user._id,
  });

  res.json(new ApiResponse(200, { member, membership, payment, invoice }, 'Membership renewed'));
});

export const assignTrainer = catchAsync(async (req, res) => {
  const member = await Member.findOneAndUpdate(
    { _id: req.params.id, gymId: req.gymId },
    { assignedTrainerId: req.body.trainerId },
    { new: true }
  );
  if (!member) throw new ApiError(404, 'Member not found');
  res.json(new ApiResponse(200, member, 'Trainer assigned'));
});

export const getExpiryRemindersList = catchAsync(async (req, res) => {
  const members = await getExpiryReminders(req.gymId);
  res.json(new ApiResponse(200, members));
});

export const getMembersWithDues = catchAsync(async (req, res) => {
  const memberships = await Membership.find({ gymId: req.gymId, dueAmount: { $gt: 0 }, status: { $ne: MEMBER_STATUS.INACTIVE } })
    .populate('memberId', 'fullName mobile status');
  const totalDue = memberships.reduce((sum, m) => sum + m.dueAmount, 0);
  res.json(new ApiResponse(200, { memberships, totalDue, count: memberships.length }));
});

export const getMembershipHistory = catchAsync(async (req, res) => {
  const history = await Membership.find({ gymId: req.gymId, memberId: req.params.memberId }).sort({ createdAt: -1 });
  res.json(new ApiResponse(200, history));
});
