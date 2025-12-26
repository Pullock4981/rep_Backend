const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Warehouse is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      default: 0,
      min: [0, 'Quantity cannot be negative'],
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Reserved quantity cannot be negative'],
    },
    availableQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Available quantity cannot be negative'],
    },
    // Cost tracking
    averageCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Value tracking
    totalValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
inventorySchema.index({ productId: 1, warehouseId: 1 }, { unique: true });
inventorySchema.index({ productId: 1 });
inventorySchema.index({ warehouseId: 1 });
inventorySchema.index({ companyId: 1 });

// Virtual to calculate available quantity
inventorySchema.virtual('calculatedAvailable').get(function () {
  return Math.max(0, this.quantity - this.reservedQuantity);
});

// Pre-save middleware to update available quantity
inventorySchema.pre('save', function (next) {
  this.availableQuantity = Math.max(0, this.quantity - this.reservedQuantity);
  this.totalValue = this.quantity * this.averageCost;
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);

