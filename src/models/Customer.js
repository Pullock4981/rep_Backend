const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true,
    },
    type: {
      type: String,
      enum: ['individual', 'company', 'retailer', 'wholesaler'],
      default: 'individual',
    },
    // Contact Information
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    alternatePhone: {
      type: String,
      trim: true,
    },
    // Address
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
    // Business Information
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
      trim: true,
    },
    // Financial Information
    creditLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentTerms: {
      type: String,
      enum: ['cash', 'net_7', 'net_15', 'net_30', 'net_60', 'custom'],
      default: 'cash',
    },
    customPaymentTerms: {
      type: Number, // Days
    },
    // Status
    status: {
      type: String,
      enum: ['active', 'inactive', 'blocked'],
      default: 'active',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Notes
    notes: {
      type: String,
      trim: true,
    },
    // Company & User tracking
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
customerSchema.index({ name: 1, companyId: 1 });
customerSchema.index({ code: 1, companyId: 1 }, { unique: true, sparse: true });
customerSchema.index({ email: 1, companyId: 1 }, { sparse: true });
customerSchema.index({ phone: 1, companyId: 1 });
customerSchema.index({ companyId: 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ isActive: 1 });
customerSchema.index({ type: 1 });

// Text search index
customerSchema.index({ name: 'text', email: 'text', phone: 'text' });

module.exports = mongoose.model('Customer', customerSchema);

