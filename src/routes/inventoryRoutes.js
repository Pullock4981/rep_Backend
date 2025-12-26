const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');
const { checkValidation } = require('../middleware/validation');
const inventoryValidation = require('../validations/inventoryValidation');

// All routes require authentication
router.use(protect);

// Get inventory by product
router.get('/product/:productId', inventoryController.getByProduct);

// Get inventory by warehouse
router.get('/warehouse/:warehouseId', inventoryController.getByWarehouse);

// Get low stock items
router.get('/low-stock/all', inventoryController.getLowStock);

// Stock operations
router.post(
  '/add',
  inventoryValidation.addStock,
  checkValidation,
  inventoryController.addStock
);

router.post(
  '/remove',
  inventoryValidation.removeStock,
  checkValidation,
  inventoryController.removeStock
);

router.post(
  '/adjust',
  inventoryValidation.adjustStock,
  checkValidation,
  inventoryController.adjustStock
);

router.post(
  '/transfer',
  inventoryValidation.transferStock,
  checkValidation,
  inventoryController.transferStock
);

// Reserve/Release quantity
router.post('/reserve', inventoryController.reserveQuantity);
router.post('/release', inventoryController.releaseReservedQuantity);

// Stock movements
router.get('/movements/all', inventoryController.getMovements);

module.exports = router;

