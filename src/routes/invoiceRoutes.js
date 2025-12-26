const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { protect } = require('../middleware/auth');
const { checkValidation } = require('../middleware/validation');
const invoiceValidation = require('../validations/invoiceValidation');

// All routes require authentication
router.use(protect);

// Invoice routes
router
  .route('/')
  .get(invoiceController.getAll);

// Create invoice from sales order
router.post(
  '/from-sales-order',
  invoiceValidation.createFromSalesOrder,
  checkValidation,
  invoiceController.createFromSalesOrder
);

// Create standalone invoice
router.post(
  '/standalone',
  invoiceValidation.createStandalone,
  checkValidation,
  invoiceController.createStandalone
);

router
  .route('/:id')
  .get(invoiceController.getById);

// Get overdue invoices (must be before /:id route)
router.get('/overdue/all', invoiceController.getOverdue);

// Get invoice summary
router.get('/summary/all', invoiceController.getSummary);

// Get invoices by customer (must be before /:id route)
router.get('/customer/:customerId', invoiceController.getByCustomer);

module.exports = router;

