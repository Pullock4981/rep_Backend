const { validationResult } = require('express-validator');
const ValidationError = require('../exceptions/ValidationError');

/**
 * Check validation results
 */
exports.checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.param,
      message: error.msg,
    }));
    
    return next(new ValidationError('Validation failed', errorMessages));
  }
  
  next();
};

