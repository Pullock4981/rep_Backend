const mongoose = require('mongoose');
const paymentMethod = require('../enums/paymentMethod');
const paymentStatus = require('../enums/paymentStatus');

const paymentSchema = new mongoose.Schema(
  {
    paymentNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Reference to invoice or purchase order
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
    },
    purchaseOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
    },
    // Customer or Supplier
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    // Payment Details
    date: {
      type: Date,
      required: [true, 'Payment date is required'],
      default: Date.now,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0.01, 'Payment amount must be greater than 0'],
    },
    method: {
      type: String,
      enum: Object.values(paymentMethod),
      required: [true, 'Payment method is required'],
    },
    referenceNumber: {
      type: String,
      trim: true,
    },
    // Bank Details (if applicable)
    bankName: {
      type: String,
      trim: true,
    },
    chequeNumber: {
      type: String,
      trim: true,
    },
    // Status
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'completed',
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
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
paymentSchema.index({ paymentNumber: 1, companyId: 1 }, { unique: true });
paymentSchema.index({ invoiceId: 1 });
paymentSchema.index({ purchaseOrderId: 1 });
paymentSchema.index({ customerId: 1 });
paymentSchema.index({ supplierId: 1 });
paymentSchema.index({ companyId: 1 });
paymentSchema.index({ date: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);

