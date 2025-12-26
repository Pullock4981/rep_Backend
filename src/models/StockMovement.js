const mongoose = require('mongoose');
const inventoryAction = require('../enums/inventoryAction');

const stockMovementSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    toWarehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
    },
    action: {
      type: String,
      enum: Object.values(inventoryAction),
      required: [true, 'Action is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
    },
    previousQuantity: {
      type: Number,
      default: 0,
    },
    newQuantity: {
      type: Number,
      required: true,
    },
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    referenceType: {
      type: String,
      enum: ['purchase', 'sales', 'adjustment', 'transfer', 'return', 'other'],
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
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
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
stockMovementSchema.index({ productId: 1, warehouseId: 1 });
stockMovementSchema.index({ productId: 1 });
stockMovementSchema.index({ warehouseId: 1 });
stockMovementSchema.index({ action: 1 });
stockMovementSchema.index({ referenceType: 1, referenceId: 1 });
stockMovementSchema.index({ companyId: 1 });
stockMovementSchema.index({ createdAt: -1 });

module.exports = mongoose.model('StockMovement', stockMovementSchema);

