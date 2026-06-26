import { Payment } from '../models/Payment.js';
import { Membership } from '../models/Membership.js';
import { Member } from '../models/Member.js';
import { Invoice } from '../models/Invoice.js';
import { Gym } from '../models/Gym.js';
import { GymSettings } from '../models/GymSettings.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { ACTIVITY_ACTIONS } from '../utils/constants.js';
import { createInvoice, generateInvoicePDF } from '../services/invoice.service.js';
import { logActivity } from '../services/activityLog.service.js';
import { MembershipPlan } from '../models/MembershipPlan.js';

export const collectPayment = catchAsync(async (req, res) => {
  const { membershipId, paidAmount, paymentMethod, notes } = req.body;
  const membership = await Membership.findOne({ _id: membershipId, gymId: req.gymId });
  if (!membership) throw new ApiError(404, 'Membership not found');
  if (membership.dueAmount <= 0) throw new ApiError(400, 'No due amount');

  const payAmount = Math.min(paidAmount, membership.dueAmount);
  membership.paidAmount += payAmount;
  membership.dueAmount -= payAmount;
  await membership.save();

  const payment = await Payment.create({
    gymId: req.gymId,
    memberId: membership.memberId,
    membershipId: membership._id,
    amount: membership.finalAmount,
    discountAmount: membership.discount?.amount || 0,
    taxAmount: membership.tax?.amount || 0,
    paidAmount: payAmount,
    dueAmount: membership.dueAmount,
    paymentMethod: paymentMethod || 'cash',
    notes,
    collectedBy: req.user._id,
  });

  const member = await Member.findById(membership.memberId);
  const gym = await Gym.findById(req.gymId);
  const settings = await GymSettings.findOne({ gymId: req.gymId });

  let planName = 'Membership';
  if (membership.isCustomPlan) planName = membership.customPlan?.name;
  else if (membership.planId) {
    const plan = await MembershipPlan.findById(membership.planId);
    planName = plan?.name || planName;
  }

  const invoice = await createInvoice({ gym, member, membership, payment, planName, settings });
  payment.invoiceId = invoice._id;
  await payment.save();

 await logActivity({
  gymId: req.gymId,
  action: ACTIVITY_ACTIONS.FEE_COLLECTED,
  entityType: 'payment',
  entityId: payment._id,
  description: `₹${payAmount} collected from ${member.fullName}`,
  performedBy: req.user._id,
});

  res.status(201).json(new ApiResponse(201, { payment, invoice, membership }, 'Payment collected'));
});

export const getPayments = catchAsync(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const filter = { gymId: req.gymId };

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate('memberId', 'fullName mobile')
      .populate('collectedBy', 'name')
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Payment.countDocuments(filter),
  ]);

  res.json(new ApiResponse(200, { payments, total }));
});

export const getInvoices = catchAsync(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const filter = { gymId: req.gymId };

  if (search) {
    filter.$or = [
      { invoiceNumber: { $regex: search, $options: 'i' } },
      { 'memberSnapshot.fullName': { $regex: search, $options: 'i' } },
      { 'memberSnapshot.mobile': { $regex: search, $options: 'i' } },
    ];
  }

  const [invoices, total] = await Promise.all([
    Invoice.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Invoice.countDocuments(filter),
  ]);

  res.json(new ApiResponse(200, { invoices, total }));
});

export const getInvoice = catchAsync(async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, gymId: req.gymId });
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  res.json(new ApiResponse(200, invoice));
});

export const downloadInvoicePDF = catchAsync(async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, gymId: req.gymId });
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  const pdf = await generateInvoicePDF(invoice);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
  'Content-Disposition',
  `attachment; filename=${invoice.invoiceNumber}.pdf`
);
  res.send(pdf);
});

export const getPublicInvoice = catchAsync(async (req, res) => {
  const invoice = await Invoice.findOne({ publicToken: req.params.token });
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  res.json(new ApiResponse(200, invoice));
});

export const downloadPublicInvoicePDF = catchAsync(async (req, res) => {
  const invoice = await Invoice.findOne({ publicToken: req.params.token });
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  const pdf = await generateInvoicePDF(invoice);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
  'Content-Disposition',
  `attachment; filename=${invoice.invoiceNumber}.pdf`
);
  res.send(pdf);
});