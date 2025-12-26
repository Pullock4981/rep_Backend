const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const { protect } = require('../middleware/auth');
const { checkValidation } = require('../middleware/validation');
const brandValidation = require('../validations/brandValidation');

// All routes require authentication
router.use(protect);

// Brand routes
router
  .route('/')
  .get(brandController.getAll)
  .post(
    brandValidation.createBrand,
    checkValidation,
    brandController.create
  );

router
  .route('/:id')
  .get(brandController.getById)
  .put(
    brandValidation.updateBrand,
    checkValidation,
    brandController.update
  )
  .delete(brandController.delete);

module.exports = router;

