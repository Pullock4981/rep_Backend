const { body } = require('express-validator');

exports.createUnit = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Unit name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Unit name must be between 1 and 50 characters'),

  body('shortName')
    .trim()
    .notEmpty()
    .withMessage('Unit short name is required')
    .isLength({ min: 1, max: 10 })
    .withMessage('Unit short name must be between 1 and 10 characters')
    .isUppercase()
    .withMessage('Short name should be uppercase'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description must be less than 200 characters'),
];

exports.updateUnit = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Unit name must be between 1 and 50 characters'),

  body('shortName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Unit short name must be between 1 and 10 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description must be less than 200 characters'),
];

