const mongoose = require('mongoose');
const orderStatus = require('../enums/orderStatus');
const paymentStatus = require('../enums/paymentStatus');

const purchaseOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier is required'],
    },
    date: {
      type: Date,
      required: [true, 'Order date is required'],
      default: Date.now,
    },
    expectedDate: {
      type: Date,
    },
    receivedDate: {
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
        receivedQuantity: {
          type: Number,
          default: 0,
          min: [0, 'Received quantity cannot be negative'],
        },
        unitCost: {
          type: Number,
          required: true,
          min: [0, 'Unit cost cannot be negative'],
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
    // Receiving Information
    isFullyReceived: {
      type: Boolean,
      default: false,
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
purchaseOrderSchema.index({ orderNumber: 1, companyId: 1 }, { unique: true });
purchaseOrderSchema.index({ supplierId: 1 });
purchaseOrderSchema.index({ companyId: 1 });
purchaseOrderSchema.index({ warehouseId: 1 });
purchaseOrderSchema.index({ date: -1 });
purchaseOrderSchema.index({ status: 1 });
purchaseOrderSchema.index({ paymentStatus: 1 });
purchaseOrderSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate totals
purchaseOrderSchema.pre('save', function (next) {
  // Calculate item totals
  this.items.forEach((item) => {
    const itemSubtotal = item.quantity * item.unitCost;
    const itemDiscount = item.discount || 0;
    const itemTax = item.tax || 0;
    item.total = itemSubtotal - itemDiscount + itemTax;
  });

  // Calculate order totals
  this.subtotal = this.items.reduce((sum, item) => {
    return sum + item.quantity * item.unitCost;
  }, 0);

  this.totalDiscount = this.items.reduce((sum, item) => sum + (item.discount || 0), 0);
  this.totalTax = this.items.reduce((sum, item) => sum + (item.tax || 0), 0);

  this.totalAmount = this.subtotal - this.totalDiscount + this.totalTax + (this.shippingCharges || 0);
  this.balanceAmount = this.totalAmount - (this.paidAmount || 0);

  // Check if fully received
  this.isFullyReceived = this.items.every((item) => item.receivedQuantity >= item.quantity);

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

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);

