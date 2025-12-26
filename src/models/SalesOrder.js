const mongoose = require('mongoose');
const orderStatus = require('../enums/orderStatus');
const paymentStatus = require('../enums/paymentStatus');

const salesOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
    },
    date: {
      type: Date,
      required: [true, 'Order date is required'],
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    // Order Items
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [0.01, 'Quantity must be greater than 0'],
        },
        unitPrice: {
          type: Number,
          required: true,
          min: [0, 'Unit price cannot be negative'],
        },
        discount: {
          type: Number,
          default: 0,
          min: [0, 'Discount cannot be negative'],
        },
        tax: {
          type: Number,
          default: 0,
          min: [0, 'Tax cannot be negative'],
        },
        total: {
          type: Number,
          required: true,
          min: [0, 'Total cannot be negative'],
        },
      },
    ],
    // Pricing Summary
    subtotal: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Subtotal cannot be negative'],
    },
    totalDiscount: {
      type: Number,
      default: 0,
      min: [0, 'Total discount cannot be negative'],
    },
    totalTax: {
      type: Number,
      default: 0,
      min: [0, 'Total tax cannot be negative'],
    },
    shippingCharges: {
      type: Number,
      default: 0,
      min: [0, 'Shipping charges cannot be negative'],
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Total amount cannot be negative'],
    },
    // Payment Information
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Paid amount cannot be negative'],
    },
    balanceAmount: {
      type: Number,
      default: 0,
    },
    // Status
    status: {
      type: String,
      enum: Object.values(orderStatus),
      default: orderStatus.PENDING,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(paymentStatus),
      default: paymentStatus.PENDING,
    },
    // Shipping Information
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    // Notes
    notes: {
      type: String,
      trim: true,
    },
    internalNotes: {
      type: String,
      trim: true,
    },
    // Company & User tracking
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
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
salesOrderSchema.index({ orderNumber: 1, companyId: 1 }, { unique: true });
salesOrderSchema.index({ customerId: 1 });
salesOrderSchema.index({ companyId: 1 });
salesOrderSchema.index({ warehouseId: 1 });
salesOrderSchema.index({ date: -1 });
salesOrderSchema.index({ status: 1 });
salesOrderSchema.index({ paymentStatus: 1 });
salesOrderSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate totals
salesOrderSchema.pre('save', function (next) {
  // Calculate item totals
  this.items.forEach((item) => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const itemDiscount = item.discount || 0;
    const itemTax = item.tax || 0;
    item.total = itemSubtotal - itemDiscount + itemTax;
  });

  // Calculate order totals
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
  } else if (this.paidAmount > 0) {
    this.paymentStatus = paymentStatus.PARTIAL;
  } else {
    this.paymentStatus = paymentStatus.PENDING;
  }

  next();
});

module.exports = mongoose.model('SalesOrder', salesOrderSchema);

