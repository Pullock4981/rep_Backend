const { body } = require('express-validator');
const paymentMethod = require('../enums/paymentMethod');

exports.createForInvoice = [
  body('invoiceId')
    .notEmpty()
    .withMessage('Invoice ID is required')
    .isMongoId()
    .withMessage('Invalid invoice ID'),

  body('amount')
    .notEmpty()
    .withMessage('Payment amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Payment amount must be greater than 0'),

  body('method')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(Object.values(paymentMethod))
    .withMessage('Invalid payment method'),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
];

exports.createForPurchaseOrder = [
  body('purchaseOrderId')
    .notEmpty()
    .withMessage('Purchase order ID is required')
    .isMongoId()
    .withMessage('Invalid purchase order ID'),

  body('amount')
    .notEmpty()
    .withMessage('Payment amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Payment amount must be greater than 0'),

  body('method')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(Object.values(paymentMethod))
    .withMessage('Invalid payment method'),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
];

