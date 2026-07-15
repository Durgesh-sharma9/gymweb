import { Member } from '../models/Member.js';
import { Membership } from '../models/Membership.js';
import { Payment } from '../models/Payment.js';
import { Expense } from '../models/Expense.js';
import { User } from '../models/User.js';
import { RegistrationRequest } from '../models/RegistrationRequest.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { Attendance } from '../models/Attendance.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { ROLES, MEMBER_STATUS, STATUS } from '../utils/constants.js';
import { getExpiryReminders } from '../services/membership.service.js';

export const getOwnerDashboard = catchAsync(async (req, res) => {
  const gymId = req.gymId;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  const weekEnd = new Date(todayStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    totalMembers, activeMembers, expiredMembers, inactiveMembers, totalTrainers,
    monthlyPayments, totalPayments, todayPayments, monthlyExpenses, totalExpenses,
    upcomingRenewals, membersWithDues, pendingRegistrations,
    expiringToday, expiringThisWeek, todayAttendance, monthlyAttendance,
    recentActivities,
  ] = await Promise.all([
    Member.countDocuments({ gymId }),
    Member.countDocuments({ gymId, status: MEMBER_STATUS.ACTIVE }),
    Member.countDocuments({ gymId, status: MEMBER_STATUS.EXPIRED }),
    Member.countDocuments({ gymId, status: MEMBER_STATUS.INACTIVE }),
    User.countDocuments({ gymId, role: ROLES.TRAINER, status: STATUS.ACTIVE }),
    Payment.aggregate([
      { $match: { gymId, paymentDate: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$paidAmount' } } },
    ]),
    Payment.aggregate([{ $match: { gymId } }, { $group: { _id: null, total: { $sum: '$paidAmount' } } }]),
    Payment.aggregate([
      { $match: { gymId, paymentDate: { $gte: todayStart, $lt: todayEnd } } },
      { $group: { _id: null, total: { $sum: '$paidAmount' } } },
    ]),
    Expense.aggregate([
      { $match: { gymId, status: STATUS.ACTIVE, expenseDate: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Expense.aggregate([
      { $match: { gymId, status: STATUS.ACTIVE } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Membership.find({
      gymId, status: MEMBER_STATUS.ACTIVE,
      endDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
    }).populate('memberId', 'fullName mobile').limit(10),
    Membership.aggregate([
      { $match: { gymId, dueAmount: { $gt: 0 } } },
      { $group: { _id: null, totalDue: { $sum: '$dueAmount' }, count: { $sum: 1 } } },
    ]),
    RegistrationRequest.countDocuments({ gymId, status: STATUS.PENDING }),
    Membership.countDocuments({ gymId, status: MEMBER_STATUS.ACTIVE, endDate: { $gte: todayStart, $lt: todayEnd } }),
    Membership.countDocuments({ gymId, status: MEMBER_STATUS.ACTIVE, endDate: { $gte: todayStart, $lte: weekEnd } }),
    Attendance.countDocuments({ gymId, checkIn: { $gte: todayStart, $lt: todayEnd } }),
    Attendance.countDocuments({ gymId, checkIn: { $gte: monthStart } }),
    ActivityLog.find({ gymId })
      .populate('performedBy', 'name')
      .sort({ performedAt: -1 })
      .limit(8),
  ]);

  const monthlyRevenue = monthlyPayments[0]?.total || 0;
  const totalRevenue = totalPayments[0]?.total || 0;
  const todayRevenue = todayPayments[0]?.total || 0;
  const monthlyExpenseTotal = monthlyExpenses[0]?.total || 0;
  const totalExpenseTotal = totalExpenses[0]?.total || 0;

  res.json(new ApiResponse(200, {
    totalMembers, activeMembers, expiredMembers, inactiveMembers, totalTrainers,
    todayRevenue, monthlyRevenue, totalRevenue,
    monthlyExpenses: monthlyExpenseTotal, totalExpenses: totalExpenseTotal,
    monthlyProfit: monthlyRevenue - monthlyExpenseTotal,
    totalProfit: totalRevenue - totalExpenseTotal,
    todayAttendance, monthlyAttendance,
    upcomingRenewals,
    totalDueAmount: membersWithDues[0]?.totalDue || 0,
    membersWithDuesCount: membersWithDues[0]?.count || 0,
    pendingRegistrations,
    expiryReminders: await getExpiryReminders(gymId),
    expiringToday,
    expiringThisWeek,
    recentActivities,
  }));
});
