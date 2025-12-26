const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const { protect } = require('../middleware/auth');
const { checkValidation } = require('../middleware/validation');
const warehouseValidation = require('../validations/warehouseValidation');

// All routes require authentication
router.use(protect);

// Warehouse routes
router
  .route('/')
  .get(warehouseController.getAll)
  .post(
    warehouseValidation.createWarehouse,
    checkValidation,
    warehouseController.create
  );

router
  .route('/:id')
  .get(warehouseController.getById)
  .put(
    warehouseValidation.updateWarehouse,
    checkValidation,
    warehouseController.update
  )
  .delete(warehouseController.delete);

// Get active warehouses
router.get('/active/all', warehouseController.getActive);

// Get main warehouse
router.get('/main/one', warehouseController.getMain);

module.exports = router;

