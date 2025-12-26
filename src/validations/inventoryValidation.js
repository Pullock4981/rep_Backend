const { body } = require('express-validator');

exports.addStock = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('warehouseId')
    .notEmpty()
    .withMessage('Warehouse ID is required')
    .isMongoId()
    .withMessage('Invalid warehouse ID'),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be a positive number'),

  body('cost')
    .notEmpty()
    .withMessage('Cost is required')
    .isFloat({ min: 0 })
    .withMessage('Cost must be a non-negative number'),
];

exports.removeStock = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('warehouseId')
    .notEmpty()
    .withMessage('Warehouse ID is required')
    .isMongoId()
    .withMessage('Invalid warehouse ID'),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be a positive number'),
];

exports.adjustStock = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('warehouseId')
    .notEmpty()
    .withMessage('Warehouse ID is required')
    .isMongoId()
    .withMessage('Invalid warehouse ID'),

  body('newQuantity')
    .notEmpty()
    .withMessage('New quantity is required')
    .isFloat({ min: 0 })
    .withMessage('New quantity must be a non-negative number'),
];

exports.transferStock = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('fromWarehouseId')
    .notEmpty()
    .withMessage('Source warehouse ID is required')
    .isMongoId()
    .withMessage('Invalid source warehouse ID'),

  body('toWarehouseId')
    .notEmpty()
    .withMessage('Destination warehouse ID is required')
    .isMongoId()
    .withMessage('Invalid destination warehouse ID'),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be a positive number'),
];

