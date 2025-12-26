const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Unit name is required'],
      trim: true,
    },
    shortName: {
      type: String,
      required: [true, 'Unit short name is required'],
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
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
unitSchema.index({ name: 1, companyId: 1 }, { unique: true });
unitSchema.index({ shortName: 1, companyId: 1 }, { unique: true });
unitSchema.index({ companyId: 1 });
unitSchema.index({ isActive: 1 });

module.exports = mongoose.model('Unit', unitSchema);

