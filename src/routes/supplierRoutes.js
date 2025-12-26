const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { protect } = require('../middleware/auth');
const { checkValidation } = require('../middleware/validation');
const supplierValidation = require('../validations/supplierValidation');

// All routes require authentication
router.use(protect);

// Supplier routes
router
  .route('/')
  .get(supplierController.getAll)
  .post(
    supplierValidation.createSupplier,
    checkValidation,
    supplierController.create
  );

router
  .route('/:id')
  .get(supplierController.getById)
  .put(
    supplierValidation.updateSupplier,
    checkValidation,
    supplierController.update
  )
  .delete(supplierController.delete);

// Search suppliers (must be before /:id route)
router.get('/search/q', supplierController.search);

// Get active suppliers
router.get('/active/all', supplierController.getActive);

module.exports = router;

