const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { checkValidation } = require('../middleware/validation');
const paymentValidation = require('../validations/paymentValidation');

// All routes require authentication
router.use(protect);

// Payment routes
router
  .route('/')
  .get(paymentController.getAll);

// Create payment for invoice
router.post(
  '/for-invoice',
  paymentValidation.createForInvoice,
  checkValidation,
  paymentController.createForInvoice
);

// Create payment for purchase order
router.post(
  '/for-purchase-order',
  paymentValidation.createForPurchaseOrder,
  checkValidation,
  paymentController.createForPurchaseOrder
);

// Get payment summary
router.get('/summary/all', paymentController.getSummary);

// Get payments by invoice (must be before /:id route)
router.get('/invoice/:invoiceId', paymentController.getByInvoice);

// Get payments by customer (must be before /:id route)
router.get('/customer/:customerId', paymentController.getByCustomer);

module.exports = router;

