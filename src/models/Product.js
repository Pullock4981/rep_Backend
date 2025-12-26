const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    sku: {
      type: String,
      unique: true,
      trim: true,
      sparse: true, // Allow null/undefined but enforce uniqueness when present
    },
    barcode: {
      type: String,
      trim: true,
      sparse: true,
    },
    description: {
      type: String,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
    },
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required: [true, 'Unit is required'],
    },
    // Pricing
    costPrice: {
      type: Number,
      required: [true, 'Cost price is required'],
      min: [0, 'Cost price cannot be negative'],
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative'],
    },
    // Stock settings
    minStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxStock: {
      type: Number,
      min: 0,
    },
    reorderLevel: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Images
    images: [
      {
        url: String,
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    // Status
    status: {
      type: String,
      enum: ['active', 'inactive', 'discontinued'],
      default: 'active',
    },
    isActive: {
      type: Boolean,
      default: true,
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
productSchema.index({ sku: 1, companyId: 1 }, { unique: true, sparse: true });
productSchema.index({ barcode: 1, companyId: 1 }, { sparse: true });
productSchema.index({ name: 1, companyId: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ brandId: 1 });
productSchema.index({ companyId: 1 });
productSchema.index({ status: 1 });
productSchema.index({ isActive: 1 });

// Text search index
productSchema.index({ name: 'text', description: 'text', sku: 'text' });

// Virtual for current stock (will be populated from Inventory model)
productSchema.virtual('currentStock', {
  ref: 'Inventory',
  localField: '_id',
  foreignField: 'productId',
  justOne: true,
});

// Method to check if stock is low
productSchema.methods.isLowStock = function (currentQuantity) {
  return currentQuantity <= this.reorderLevel;
};

module.exports = mongoose.model('Product', productSchema);

