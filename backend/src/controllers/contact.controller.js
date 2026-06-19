import { Contact } from '../models/Contact.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const submitContact = catchAsync(async (req, res) => {
  const { name, email, mobile, message } = req.body;

  if (!name || !email || !message) {
    throw new ApiError(400, 'Name, email, and message are required');
  }

  const contact = await Contact.create({
    name,
    email: email.toLowerCase(),
    mobile,
    message,
    status: 'new',
  });

  res.json(new ApiResponse(201, { contact }, 'Contact form submitted successfully'));
});

export const getContacts = catchAsync(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const contacts = await Contact.find(filter).sort({ createdAt: -1 });
  res.json(new ApiResponse(200, { contacts }, 'Contacts retrieved'));
});

export const updateContactStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const contact = await Contact.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!contact) {
    throw new ApiError(404, 'Contact not found');
  }

  res.json(new ApiResponse(200, { contact }, 'Contact status updated'));
});
