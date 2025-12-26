const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Company email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Company phone is required'],
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'Bangladesh',
      },
    },
    logo: {
      type: String,
    },
    taxId: {
      type: String,
      trim: true,
    },
    registrationNumber: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
    },
    currency: {
      type: String,
      default: 'BDT',
    },
    timezone: {
      type: String,
      default: 'Asia/Dhaka',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    settings: {
      allowNegativeStock: {
        type: Boolean,
        default: false,
      },
      autoGenerateInvoice: {
        type: Boolean,
        default: true,
      },
      taxEnabled: {
        type: Boolean,
        default: true,
      },
      taxRate: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
companySchema.index({ email: 1 });
companySchema.index({ isActive: 1 });

module.exports = mongoose.model('Company', companySchema);

