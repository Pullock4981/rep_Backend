const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { checkValidation } = require('../middleware/validation');
const categoryValidation = require('../validations/categoryValidation');

// All routes require authentication
router.use(protect);

// Category routes
router
  .route('/')
  .get(categoryController.getAll)
  .post(
    categoryValidation.createCategory,
    checkValidation,
    categoryController.create
  );

router
  .route('/:id')
  .get(categoryController.getById)
  .put(
    categoryValidation.updateCategory,
    checkValidation,
    categoryController.update
  )
  .delete(categoryController.delete);

// Get parent categories only
router.get('/parents/all', categoryController.getParentCategories);

module.exports = router;

