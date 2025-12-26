const { body } = require('express-validator');

exports.createFromSalesOrder = [
  body('salesOrderId')
    .notEmpty()
    .withMessage('Sales order ID is required')
    .isMongoId()
    .withMessage('Invalid sales order ID'),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid due date format'),
];

exports.createStandalone = [
  body('customerId')
    .notEmpty()
    .withMessage('Customer is required')
    .isMongoId()
    .withMessage('Invalid customer ID'),

  body('date')
    .notEmpty()
    .withMessage('Invoice date is required')
    .isISO8601()
    .withMessage('Invalid date format'),

  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Invalid due date format'),

  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),

  body('items.*.productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be greater than 0'),

  body('items.*.unitPrice')
    .notEmpty()
    .withMessage('Unit price is required')
    .isFloat({ min: 0 })
    .withMessage('Unit price cannot be negative'),
];

