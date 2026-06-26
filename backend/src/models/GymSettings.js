import mongoose from 'mongoose';
import { RECEIPT_TEMPLATES } from '../utils/constants.js';

const gymSettingsSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true, unique: true },
    discountEnabled: { type: Boolean, default: false },
    taxEnabled: { type: Boolean, default: false },
    taxName: { type: String, default: 'GST' },
    taxPercentage: { type: Number, default: 18 },
    taxMode: { type: String, enum: ['included', 'added_extra'], default: 'included' },
    showTaxBreakdownOnInvoice: { type: Boolean, default: false },
    defaultReceiptTemplate: {
      type: String,
      enum: RECEIPT_TEMPLATES,
      default: 'professional_white',
    },
    invoicePrefix: { type: String, default: 'INV' },
    invoiceCounter: { type: Number, default: 0 },
    registrationEnabled: { type: Boolean, default: true },
    registrationToken: { type: String, unique: true, sparse: true },
    whatsappNumber: String,
    whatsappTemplates: {
      newMembership: { type: String, default: '🏋️ Welcome to {gymName}\n\nHello {memberName},\n\nYour membership has been successfully activated.\n\n📋 Membership Details\n\nMember ID: {memberId}\nPlan: {planName}\n\n💰 Payment Details\n\nPlan Amount: ₹{planAmount}\nDiscount: ₹{discount}\nAmount Paid: ₹{finalAmount}\n\n📅 Membership Period\n\nStart Date: {startDate}\nExpiry Date: {endDate}\n\n🧾 Receipt\n\nView / Download Receipt:\n{receiptUrl}\n\nThank you for choosing {gymName}.\n\nFor assistance please contact us.\n\n{gymName}\n{gymMobile}' },
      renewal: { type: String, default: '🎉 Membership Renewed Successfully\n\nMember ID: {memberId}\n\nPrevious Expiry:\n{oldExpiry}\n\nNew Expiry:\n{newExpiry}\n\nPlan: {planName}\n\nPlan Amount: ₹{planAmount}\nDiscount: ₹{discount}\nAmount Paid: ₹{finalAmount}\n\nReceipt:\n{receiptUrl}' },
      dueReminder: { type: String, default: 'Hi {name}, you have a due amount of ₹{dueAmount}. Please pay at the earliest.' },
      expiryReminder: { type: String, default: 'Hi {name}, your membership expired on {endDate}. Please renew to continue.' },
    },
  },
  { timestamps: true }
);

export const GymSettings = mongoose.model('GymSettings', gymSettingsSchema);