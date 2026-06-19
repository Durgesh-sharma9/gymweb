import { DemoRequest } from '../models/DemoRequest.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const bookDemo = catchAsync(async (req, res) => {
  const { name, gymName, mobile, city } = req.body;

  if (!name || !gymName || !mobile || !city) {
    throw new ApiError(400, 'All fields are required');
  }

  const demoRequest = await DemoRequest.create({
    name,
    gymName,
    mobile,
    city,
    status: 'pending',
  });

  res.json(new ApiResponse(201, { demoRequest }, 'Demo request submitted successfully'));
});

export const getDemoRequests = catchAsync(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const demoRequests = await DemoRequest.find(filter).sort({ createdAt: -1 });
  res.json(new ApiResponse(200, { demoRequests }, 'Demo requests retrieved'));
});

export const updateDemoStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status, scheduledDate, notes } = req.body;

  const updateData = { status };
  if (scheduledDate) updateData.scheduledDate = scheduledDate;
  if (notes) updateData.notes = notes;

  const demoRequest = await DemoRequest.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!demoRequest) {
    throw new ApiError(404, 'Demo request not found');
  }

  res.json(new ApiResponse(200, { demoRequest }, 'Demo request status updated'));
});
