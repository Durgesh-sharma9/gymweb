import { Member } from '../models/Member.js';
import { Invoice } from '../models/Invoice.js';
import { Payment } from '../models/Payment.js';
import { Membership } from '../models/Membership.js';
import { Attendance } from '../models/Attendance.js';
import { Expense } from '../models/Expense.js';
import { Gym } from '../models/Gym.js';
import { GymSettings } from '../models/GymSettings.js';
import { MembershipPlan } from '../models/MembershipPlan.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { generateWhatsAppUrl } from '../services/whatsapp.service.js';

export const generateMessage = catchAsync(async (req, res) => {
  const { type, memberId, invoiceId } = req.query;
  const member = await Member.findOne({ _id: memberId, gymId: req.gymId });
  if (!member) throw new ApiError(404, 'Member not found');

  let invoice = null;
  if (invoiceId) {
    invoice = await Invoice.findOne({ _id: invoiceId, gymId: req.gymId });
  }

  const url = await generateWhatsAppUrl({ gymId: req.gymId, type, member, invoice });
  res.json(new ApiResponse(200, { url }));
});

export const previewPricing = catchAsync(async (req, res) => {
  const { calculatePricing } = await import('../services/tax.service.js');
  const { GymSettings } = await import('../models/GymSettings.js');
  const settings = await GymSettings.findOne({ gymId: req.gymId });

  const pricing = calculatePricing({
    baseAmount: req.body.baseAmount,
    discountType: settings?.discountEnabled ? req.body.discountType : null,
    discountValue: req.body.discountValue,
    taxEnabled: settings?.taxEnabled,
    taxName: settings?.taxName,
    taxPercentage: settings?.taxPercentage,
    taxMode: settings?.taxMode,
  });

  res.json(new ApiResponse(200, pricing));
});

export const backupGymData = catchAsync(async (req, res) => {
  const gymId = req.gymId;
  const [gym, settings, members, memberships, payments, invoices, attendance, expenses, plans] = await Promise.all([
    Gym.findById(gymId).lean(),
    GymSettings.findOne({ gymId }).lean(),
    Member.find({ gymId }).lean(),
    Membership.find({ gymId }).lean(),
    Payment.find({ gymId }).lean(),
    Invoice.find({ gymId }).lean(),
    Attendance.find({ gymId }).lean(),
    Expense.find({ gymId }).lean(),
    MembershipPlan.find({ gymId }).lean(),
  ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    gym, settings, members, memberships, payments, invoices, attendance, expenses, plans,
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=gym-backup-${gym?.slug || gymId}-${Date.now()}.json`);
  res.send(JSON.stringify(backup, null, 2));
});
