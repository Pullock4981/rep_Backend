const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    breakDuration: {
      type: Number, // in minutes
      default: 0,
    },
    workingHours: {
      type: Number, // in hours
      default: 0,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half_day', 'on_leave', 'holiday'],
      default: 'absent',
    },
    notes: {
      type: String,
      trim: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
attendanceSchema.index({ employeeId: 1, date: 1, companyId: 1 }, { unique: true });
attendanceSchema.index({ companyId: 1, date: 1 });
attendanceSchema.index({ employeeId: 1 });

// Pre-save middleware to calculate working hours
attendanceSchema.pre('save', function (next) {
  if (this.checkIn && this.checkOut) {
    const diffMs = this.checkOut - this.checkIn;
    const diffMinutes = diffMs / (1000 * 60);
    const breakMinutes = this.breakDuration || 0;
    this.workingHours = Math.max(0, (diffMinutes - breakMinutes) / 60);
    
    // Auto-set status
    if (this.workingHours >= 8) {
      this.status = 'present';
    } else if (this.workingHours >= 4) {
      this.status = 'half_day';
    } else if (this.checkIn) {
      const checkInHour = new Date(this.checkIn).getHours();
      if (checkInHour > 9) {
        this.status = 'late';
      }
    }
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);

