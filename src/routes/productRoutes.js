const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { checkValidation } = require('../middleware/validation');
const productValidation = require('../validations/productValidation');

// All routes require authentication
router.use(protect);

// Product routes
router
  .route('/')
  .get(productController.getAll)
  .post(
    productValidation.createProduct,
    checkValidation,
    productController.create
  );

router
  .route('/:id')
  .get(productController.getById)
  .put(
    productValidation.updateProduct,
    checkValidation,
    productController.update
  )
  .delete(productController.delete);

// Search products (must be before /:id route)
router.get('/search/q', productController.search);

// Get low stock products (must be before /:id route)
router.get('/low-stock/all', productController.getLowStock);

// Get products by category (must be before /:id route)
router.get('/category/:categoryId', productController.getByCategory);

// Product sections (for frontend compatibility)
router.get('/sections/favourited', productController.getAll);
router.get('/sections/frequently-downloaded', productController.getAll);
router.get('/sections/new-added', productController.getAll);

module.exports = router;

