const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { protect } = require('../middleware/auth');
const { checkValidation } = require('../middleware/validation');
const customerValidation = require('../validations/customerValidation');

// All routes require authentication
router.use(protect);

// Customer routes
router
  .route('/')
  .get(customerController.getAll)
  .post(
    customerValidation.createCustomer,
    checkValidation,
    customerController.create
  );

router
  .route('/:id')
  .get(customerController.getById)
  .put(
    customerValidation.updateCustomer,
    checkValidation,
    customerController.update
  )
  .delete(customerController.delete);

// Search customers (must be before /:id route)
router.get('/search/q', customerController.search);

// Get active customers
router.get('/active/all', customerController.getActive);

module.exports = router;

