const { body } = require('express-validator');

// Product validation rules
exports.createProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),

  body('categoryId')
    .notEmpty()
    .withMessage('Category is required')
    .isMongoId()
    .withMessage('Invalid category ID'),

  body('unitId')
    .notEmpty()
    .withMessage('Unit is required')
    .isMongoId()
    .withMessage('Invalid unit ID'),

  body('costPrice')
    .notEmpty()
    .withMessage('Cost price is required')
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a positive number'),

  body('sellingPrice')
    .notEmpty()
    .withMessage('Selling price is required')
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a positive number'),

  body('sku')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('SKU must be between 3 and 50 characters'),

  body('barcode')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Barcode must be less than 100 characters'),

  body('minStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Min stock must be a non-negative integer'),

  body('maxStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Max stock must be a non-negative integer'),

  body('reorderLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Reorder level must be a non-negative integer'),

  body('status')
    .optional()
    .isIn(['active', 'inactive', 'discontinued'])
    .withMessage('Invalid status'),

  body('brandId')
    .optional()
    .isMongoId()
    .withMessage('Invalid brand ID'),
];

exports.updateProduct = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),

  body('categoryId')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),

  body('unitId')
    .optional()
    .isMongoId()
    .withMessage('Invalid unit ID'),

  body('costPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a positive number'),

  body('sellingPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a positive number'),

  body('sku')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('SKU must be between 3 and 50 characters'),

  body('barcode')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Barcode must be less than 100 characters'),

  body('status')
    .optional()
    .isIn(['active', 'inactive', 'discontinued'])
    .withMessage('Invalid status'),
];

