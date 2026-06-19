import mongoose from 'mongoose';

const demoRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    gymName: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'completed', 'cancelled'],
      default: 'pending',
    },
    scheduledDate: Date,
    notes: String,
  },
  { timestamps: true }
);

demoRequestSchema.index({ status: 1, createdAt: -1 });

export const DemoRequest = mongoose.model('DemoRequest', demoRequestSchema);
