const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Dashboard routes
router.get('/overview', dashboardController.getOverview);
router.get('/sales/stats', dashboardController.getSalesStats);
router.get('/purchase/stats', dashboardController.getPurchaseStats);
router.get('/sales/chart', dashboardController.getSalesChart);
router.get('/products/top', dashboardController.getTopProducts);
router.get('/customers/top', dashboardController.getTopCustomers);

module.exports = router;

