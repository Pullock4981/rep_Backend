const { body } = require('express-validator');

exports.createPurchaseOrder = [
  body('supplierId')
    .notEmpty()
    .withMessage('Supplier is required')
    .isMongoId()
    .withMessage('Invalid supplier ID'),

  body('warehouseId')
    .notEmpty()
    .withMessage('Warehouse is required')
    .isMongoId()
    .withMessage('Invalid warehouse ID'),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),

  body('expectedDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid expected date format'),

  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),

  body('items.*.productId')
    .notEmpty()
    .withMessage('Product ID is required for each item')
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required for each item')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be greater than 0'),

  body('items.*.unitCost')
    .notEmpty()
    .withMessage('Unit cost is required for each item')
    .isFloat({ min: 0 })
    .withMessage('Unit cost cannot be negative'),

  body('items.*.discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount cannot be negative'),

  body('items.*.tax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax cannot be negative'),

  body('shippingCharges')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Shipping charges cannot be negative'),
];

exports.receiveGoods = [
  body('receivedItems')
    .isArray({ min: 1 })
    .withMessage('At least one received item is required'),

  body('receivedItems.*.itemId')
    .notEmpty()
    .withMessage('Item ID is required')
    .isMongoId()
    .withMessage('Invalid item ID'),

  body('receivedItems.*.quantity')
    .notEmpty()
    .withMessage('Received quantity is required')
    .isFloat({ min: 0.01 })
    .withMessage('Received quantity must be greater than 0'),
];

exports.updateStatus = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'])
    .withMessage('Invalid status'),
];

exports.addPayment = [
  body('paymentAmount')
    .notEmpty()
    .withMessage('Payment amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Payment amount must be greater than 0'),
];

