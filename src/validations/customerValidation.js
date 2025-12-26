const { body } = require('express-validator');

exports.createCustomer = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Customer name must be between 2 and 200 characters'),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone number must be between 10 and 20 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email address'),

  body('type')
    .optional()
    .isIn(['individual', 'company', 'retailer', 'wholesaler'])
    .withMessage('Invalid customer type'),

  body('code')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Customer code must be between 3 and 50 characters'),

  body('creditLimit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Credit limit must be a non-negative number'),

  body('paymentTerms')
    .optional()
    .isIn(['cash', 'net_7', 'net_15', 'net_30', 'net_60', 'custom'])
    .withMessage('Invalid payment terms'),

  body('customPaymentTerms')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Custom payment terms must be a positive integer'),

  body('status')
    .optional()
    .isIn(['active', 'inactive', 'blocked'])
    .withMessage('Invalid status'),
];

exports.updateCustomer = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Customer name must be between 2 and 200 characters'),

  body('phone')
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone number must be between 10 and 20 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email address'),

  body('type')
    .optional()
    .isIn(['individual', 'company', 'retailer', 'wholesaler'])
    .withMessage('Invalid customer type'),

  body('code')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Customer code must be between 3 and 50 characters'),

  body('creditLimit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Credit limit must be a non-negative number'),

  body('paymentTerms')
    .optional()
    .isIn(['cash', 'net_7', 'net_15', 'net_30', 'net_60', 'custom'])
    .withMessage('Invalid payment terms'),

  body('status')
    .optional()
    .isIn(['active', 'inactive', 'blocked'])
    .withMessage('Invalid status'),
];

