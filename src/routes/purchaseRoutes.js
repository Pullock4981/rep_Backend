const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { protect } = require('../middleware/auth');
const { checkValidation } = require('../middleware/validation');
const purchaseValidation = require('../validations/purchaseValidation');

// All routes require authentication
router.use(protect);

// Purchase order routes
router
  .route('/')
  .get(purchaseController.getAll)
  .post(
    purchaseValidation.createPurchaseOrder,
    checkValidation,
    purchaseController.create
  );

router
  .route('/:id')
  .get(purchaseController.getById);

// Receive goods
router.post(
  '/:id/receive',
  purchaseValidation.receiveGoods,
  checkValidation,
  purchaseController.receiveGoods
);

// Update order status
router.put(
  '/:id/status',
  purchaseValidation.updateStatus,
  checkValidation,
  purchaseController.updateStatus
);

// Add payment
router.post(
  '/:id/payment',
  purchaseValidation.addPayment,
  checkValidation,
  purchaseController.addPayment
);

// Get purchase summary
router.get('/summary/all', purchaseController.getSummary);

// Get orders by supplier (must be before /:id route)
router.get('/supplier/:supplierId', purchaseController.getBySupplier);

module.exports = router;

