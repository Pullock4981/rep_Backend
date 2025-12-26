const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
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
      enum: ['manufacturer', 'distributor', 'wholesaler', 'retailer', 'other'],
      default: 'other',
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
    // Contact Person
    contactPerson: {
      name: String,
      designation: String,
      phone: String,
      email: String,
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
supplierSchema.index({ name: 1, companyId: 1 });
supplierSchema.index({ code: 1, companyId: 1 }, { unique: true, sparse: true });
supplierSchema.index({ email: 1, companyId: 1 }, { sparse: true });
supplierSchema.index({ phone: 1, companyId: 1 });
supplierSchema.index({ companyId: 1 });
supplierSchema.index({ status: 1 });
supplierSchema.index({ isActive: 1 });
supplierSchema.index({ type: 1 });

// Text search index
supplierSchema.index({ name: 'text', email: 'text', phone: 'text' });

module.exports = mongoose.model('Supplier', supplierSchema);

