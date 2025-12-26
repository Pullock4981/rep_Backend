const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { protect } = require('../middleware/auth');
const { checkValidation } = require('../middleware/validation');
const salesValidation = require('../validations/salesValidation');

// All routes require authentication
router.use(protect);

// Sales order routes
router
  .route('/')
  .get(salesController.getAll)
  .post(
    salesValidation.createSalesOrder,
    checkValidation,
    salesController.create
  );

router
  .route('/:id')
  .get(salesController.getById);

// Update order status
router.put(
  '/:id/status',
  salesValidation.updateStatus,
  checkValidation,
  salesController.updateStatus
);

// Add payment
router.post(
  '/:id/payment',
  salesValidation.addPayment,
  checkValidation,
  salesController.addPayment
);

// Get sales summary
router.get('/summary/all', salesController.getSummary);

// Get orders by customer (must be before /:id route)
router.get('/customer/:customerId', salesController.getByCustomer);

module.exports = router;

