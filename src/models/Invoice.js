const mongoose = require('mongoose');
const paymentStatus = require('../enums/paymentStatus');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Reference to sales order
    salesOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalesOrder',
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
    },
    date: {
      type: Date,
      required: [true, 'Invoice date is required'],
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    // Invoice Items (copied from sales order)
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        productName: String,
        quantity: {
          type: Number,
          required: true,
        },
        unitPrice: {
          type: Number,
          required: true,
        },
        discount: {
          type: Number,
          default: 0,
        },
        tax: {
          type: Number,
          default: 0,
        },
        total: {
          type: Number,
          required: true,
        },
      },
    ],
    // Pricing Summary
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    totalDiscount: {
      type: Number,
      default: 0,
    },
    totalTax: {
      type: Number,
      default: 0,
    },
    shippingCharges: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    // Payment Information
    paidAmount: {
      type: Number,
      default: 0,
    },
    balanceAmount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(paymentStatus),
      default: paymentStatus.PENDING,
    },
    // Status
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      default: 'draft',
    },
    // Additional Information
    notes: {
      type: String,
      trim: true,
    },
    terms: {
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
invoiceSchema.index({ invoiceNumber: 1, companyId: 1 }, { unique: true });
invoiceSchema.index({ customerId: 1 });
invoiceSchema.index({ salesOrderId: 1 });
invoiceSchema.index({ companyId: 1 });
invoiceSchema.index({ date: -1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ paymentStatus: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate totals
invoiceSchema.pre('save', function (next) {
  // Calculate totals
  this.subtotal = this.items.reduce((sum, item) => {
    return sum + item.quantity * item.unitPrice;
  }, 0);

  this.totalDiscount = this.items.reduce((sum, item) => sum + (item.discount || 0), 0);
  this.totalTax = this.items.reduce((sum, item) => sum + (item.tax || 0), 0);

  this.totalAmount = this.subtotal - this.totalDiscount + this.totalTax + (this.shippingCharges || 0);
  this.balanceAmount = this.totalAmount - (this.paidAmount || 0);

  // Update payment status
  if (this.balanceAmount <= 0) {
    this.paymentStatus = paymentStatus.PAID;
    this.status = 'paid';
  } else if (this.paidAmount > 0) {
    this.paymentStatus = paymentStatus.PARTIAL;
  } else {
    this.paymentStatus = paymentStatus.PENDING;
  }

  // Check if overdue
  if (this.balanceAmount > 0 && new Date() > this.dueDate && this.status !== 'paid' && this.status !== 'cancelled') {
    this.status = 'overdue';
    this.paymentStatus = paymentStatus.OVERDUE;
  }

  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);

