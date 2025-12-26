const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');
const { protect } = require('../middleware/auth');
const { checkValidation } = require('../middleware/validation');
const unitValidation = require('../validations/unitValidation');

// All routes require authentication
router.use(protect);

// Unit routes
router
  .route('/')
  .get(unitController.getAll)
  .post(
    unitValidation.createUnit,
    checkValidation,
    unitController.create
  );

router
  .route('/:id')
  .get(unitController.getById)
  .put(
    unitValidation.updateUnit,
    checkValidation,
    unitController.update
  )
  .delete(unitController.delete);

module.exports = router;

