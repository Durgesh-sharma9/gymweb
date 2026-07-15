import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    checkIn: { type: Date, required: true, default: Date.now },
    checkOut: Date,
    date: { type: Date, required: true },
    notes: String,
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

attendanceSchema.index({ gymId: 1, date: -1 });
attendanceSchema.index({ gymId: 1, memberId: 1, date: -1 });
attendanceSchema.index({ gymId: 1, checkIn: -1 });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
