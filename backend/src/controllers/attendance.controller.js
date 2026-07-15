import { Attendance } from '../models/Attendance.js';
import { Member } from '../models/Member.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { MEMBER_STATUS, ACTIVITY_ACTIONS } from '../utils/constants.js';
import { logActivity } from '../services/activityLog.service.js';

const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date = new Date()) => {
  const d = startOfDay(date);
  d.setDate(d.getDate() + 1);
  return d;
};

export const checkIn = catchAsync(async (req, res) => {
  const { memberId, notes } = req.body;
  if (!memberId) throw new ApiError(400, 'Member ID required');

  const member = await Member.findOne({ _id: memberId, gymId: req.gymId });
  if (!member) throw new ApiError(404, 'Member not found');
  if (member.status === MEMBER_STATUS.INACTIVE) throw new ApiError(400, 'Inactive member cannot check in');

  const todayStart = startOfDay();
  const todayEnd = endOfDay();

  const existing = await Attendance.findOne({
    gymId: req.gymId,
    memberId,
    checkIn: { $gte: todayStart, $lt: todayEnd },
    checkOut: null,
  });
  if (existing) throw new ApiError(409, 'Member already checked in today');

  const attendance = await Attendance.create({
    gymId: req.gymId,
    memberId,
    checkIn: new Date(),
    date: todayStart,
    notes,
    recordedBy: req.user._id,
  });

  await logActivity({
    gymId: req.gymId,
    action: ACTIVITY_ACTIONS.ATTENDANCE_CHECKIN,
    entityType: 'attendance',
    entityId: attendance._id,
    description: `${member.fullName} checked in`,
    performedBy: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, { attendance, member }, 'Check-in recorded'));
});

export const checkOut = catchAsync(async (req, res) => {
  const { memberId } = req.body;
  if (!memberId) throw new ApiError(400, 'Member ID required');

  const todayStart = startOfDay();
  const todayEnd = endOfDay();

  const attendance = await Attendance.findOne({
    gymId: req.gymId,
    memberId,
    checkIn: { $gte: todayStart, $lt: todayEnd },
    checkOut: null,
  });
  if (!attendance) throw new ApiError(404, 'No active check-in found for today');

  attendance.checkOut = new Date();
  await attendance.save();

  const member = await Member.findById(memberId);

  await logActivity({
    gymId: req.gymId,
    action: ACTIVITY_ACTIONS.ATTENDANCE_CHECKOUT,
    entityType: 'attendance',
    entityId: attendance._id,
    description: `${member?.fullName || 'Member'} checked out`,
    performedBy: req.user._id,
  });

  res.json(new ApiResponse(200, attendance, 'Check-out recorded'));
});

export const getTodayAttendance = catchAsync(async (req, res) => {
  const todayStart = startOfDay();
  const todayEnd = endOfDay();

  const records = await Attendance.find({
    gymId: req.gymId,
    checkIn: { $gte: todayStart, $lt: todayEnd },
  })
    .populate('memberId', 'fullName mobile photo memberId status')
    .populate('recordedBy', 'name')
    .sort({ checkIn: -1 });

  const checkedIn = records.filter((r) => !r.checkOut).length;
  const checkedOut = records.filter((r) => r.checkOut).length;

  res.json(new ApiResponse(200, { records, summary: { total: records.length, checkedIn, checkedOut } }));
});

export const getAttendanceHistory = catchAsync(async (req, res) => {
  const { memberId, date, page = 1, limit = 20 } = req.query;
  const filter = { gymId: req.gymId };

  if (memberId) filter.memberId = memberId;
  if (date) {
    const dayStart = startOfDay(new Date(date));
    const dayEnd = endOfDay(new Date(date));
    filter.checkIn = { $gte: dayStart, $lt: dayEnd };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [records, total] = await Promise.all([
    Attendance.find(filter)
      .populate('memberId', 'fullName mobile memberId')
      .populate('recordedBy', 'name')
      .sort({ checkIn: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Attendance.countDocuments(filter),
  ]);

  res.json(new ApiResponse(200, { records, total, page: parseInt(page), pages: Math.ceil(total / limit) }));
});
