import { Member } from '../models/Member.js';
import { Membership } from '../models/Membership.js';
import { Payment } from '../models/Payment.js';
import { Attendance } from '../models/Attendance.js';
import { Expense } from '../models/Expense.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { MEMBER_STATUS, STATUS } from '../utils/constants.js';

const parseRange = (startDate, endDate) => {
  const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

export const getRevenueReport = catchAsync(async (req, res) => {
  const { start, end } = parseRange(req.query.startDate, req.query.endDate);

  const [payments, expenses, dailyRevenue] = await Promise.all([
    Payment.find({ gymId: req.gymId, paymentDate: { $gte: start, $lte: end } })
      .populate('memberId', 'fullName mobile')
      .populate('collectedBy', 'name')
      .sort({ paymentDate: -1 }),
    Expense.find({ gymId: req.gymId, status: STATUS.ACTIVE, expenseDate: { $gte: start, $lte: end } })
      .sort({ expenseDate: -1 }),
    Payment.aggregate([
      { $match: { gymId: req.gymId, paymentDate: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' } },
          revenue: { $sum: '$paidAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const totalRevenue = payments.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  res.json(new ApiResponse(200, {
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
    payments,
    expenses,
    dailyRevenue,
    period: { start, end },
  }));
});

export const getAttendanceReport = catchAsync(async (req, res) => {
  const { start, end } = parseRange(req.query.startDate, req.query.endDate);

  const [records, dailyStats] = await Promise.all([
    Attendance.find({ gymId: req.gymId, checkIn: { $gte: start, $lte: end } })
      .populate('memberId', 'fullName mobile memberId')
      .sort({ checkIn: -1 }),
    Attendance.aggregate([
      { $match: { gymId: req.gymId, checkIn: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$checkIn' } },
          count: { $sum: 1 },
          uniqueMembers: { $addToSet: '$memberId' },
        },
      },
      { $project: { date: '$_id', count: 1, uniqueMembers: { $size: '$uniqueMembers' } } },
      { $sort: { date: 1 } },
    ]),
  ]);

  res.json(new ApiResponse(200, {
    totalVisits: records.length,
    uniqueMembers: new Set(records.map((r) => r.memberId?._id?.toString())).size,
    records,
    dailyStats,
    period: { start, end },
  }));
});

export const getMemberReport = catchAsync(async (req, res) => {
  const [statusBreakdown, planBreakdown, newMembers, expiringMembers] = await Promise.all([
    Member.aggregate([
      { $match: { gymId: req.gymId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Membership.aggregate([
      { $match: { gymId: req.gymId, status: MEMBER_STATUS.ACTIVE } },
      {
        $lookup: {
          from: 'membershipplans',
          localField: 'planId',
          foreignField: '_id',
          as: 'plan',
        },
      },
      {
        $group: {
          _id: { $ifNull: [{ $arrayElemAt: ['$plan.name', 0] }, '$customPlan.name'] },
          count: { $sum: 1 },
        },
      },
    ]),
    Member.countDocuments({
      gymId: req.gymId,
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    }),
    Membership.find({
      gymId: req.gymId,
      status: MEMBER_STATUS.ACTIVE,
      endDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    })
      .populate('memberId', 'fullName mobile')
      .sort({ endDate: 1 })
      .limit(20),
  ]);

  res.json(new ApiResponse(200, {
    statusBreakdown,
    planBreakdown,
    newMembersThisMonth: newMembers,
    expiringMembers,
  }));
});
